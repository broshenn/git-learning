"""Tests for TeamFlow business operations."""

from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from teamflow.models import Priority, Status
from teamflow.repository import JsonTicketRepository
from teamflow.service import TicketNotFoundError, TicketService


class TicketServiceTest(unittest.TestCase):
    """Exercise ticket lifecycle behavior against a temporary database."""

    def setUp(self) -> None:
        """Create an isolated repository for each test."""

        self.temporary_directory = tempfile.TemporaryDirectory()
        database = Path(self.temporary_directory.name) / "tickets.json"
        self.service = TicketService(JsonTicketRepository(database))

    def tearDown(self) -> None:
        """Remove temporary files after each test."""

        self.temporary_directory.cleanup()

    def test_create_allocates_sequential_ids(self) -> None:
        """New tickets receive stable, increasing identifiers."""

        first = self.service.create("修复登录失败", Priority.HIGH)
        second = self.service.create("增加导出功能", Priority.LOW)

        self.assertEqual(1, first.id)
        self.assertEqual(2, second.id)
        self.assertEqual(Status.OPEN, first.status)

    def test_create_rejects_short_title(self) -> None:
        """A title that lacks useful context is rejected."""

        with self.assertRaisesRegex(ValueError, "at least 3"):
            self.service.create("x", Priority.MEDIUM)

    def test_assign_and_close_persist_changes(self) -> None:
        """Assignment and closure survive a repository reload."""

        ticket = self.service.create("处理支付回调", Priority.HIGH)
        self.service.assign(ticket.id, "alice")
        self.service.close(ticket.id)

        [reloaded] = self.service.list()
        self.assertEqual("alice", reloaded.owner)
        self.assertEqual(Status.CLOSED, reloaded.status)

    def test_list_filters_by_status(self) -> None:
        """Status filtering returns only matching tickets."""

        closed = self.service.create("升级数据库驱动", Priority.MEDIUM)
        self.service.close(closed.id)
        self.service.create("补充监控告警", Priority.HIGH)

        open_tickets = self.service.list(Status.OPEN)

        self.assertEqual(1, len(open_tickets))
        self.assertEqual("补充监控告警", open_tickets[0].title)


    def test_list_filters_by_owner(self) -> None:
        """Owner filtering returns only tickets assigned to that owner."""

        alice_ticket = self.service.create("修复登录超时", Priority.HIGH)
        bob_ticket = self.service.create("增加导出功能", Priority.MEDIUM)
        self.service.assign(alice_ticket.id, "alice")
        self.service.assign(bob_ticket.id, "bob")

        owner_tickets = self.service.list(owner="  alice  ")

        self.assertEqual(1, len(owner_tickets))
        self.assertEqual("修复登录超时", owner_tickets[0].title)

    def test_list_combines_status_and_owner_filters(self) -> None:
        """Status and owner filters are both applied when provided."""

        closed_ticket = self.service.create("修复支付回调", Priority.HIGH)
        open_ticket = self.service.create("补充接口监控", Priority.MEDIUM)
        self.service.assign(closed_ticket.id, "alice")
        self.service.assign(open_ticket.id, "alice")
        self.service.close(closed_ticket.id)

        matching = self.service.list(status=Status.OPEN, owner="alice")

        self.assertEqual(1, len(matching))
        self.assertEqual("补充接口监控", matching[0].title)

    def test_unknown_ticket_raises_domain_error(self) -> None:
        """Missing identifiers produce a meaningful domain error."""

        with self.assertRaisesRegex(TicketNotFoundError, "404"):
            self.service.close(404)


if __name__ == "__main__":
    unittest.main()

