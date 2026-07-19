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

    def test_unknown_ticket_raises_domain_error(self) -> None:
        """Missing identifiers produce a meaningful domain error."""

        with self.assertRaisesRegex(TicketNotFoundError, "404"):
            self.service.close(404)


if __name__ == "__main__":
    unittest.main()

