"""Command-line interface for TeamFlow."""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Sequence

from teamflow.models import Priority, Status, Ticket
from teamflow.repository import JsonTicketRepository
from teamflow.service import TicketNotFoundError, TicketService

DEFAULT_DATABASE = Path("data/tickets.json")


def build_parser() -> argparse.ArgumentParser:
    """Build the TeamFlow argument parser."""

    parser = argparse.ArgumentParser(
        prog="teamflow",
        description="Manage a small team's work tickets.",
    )
    parser.add_argument(
        "--db",
        type=Path,
        default=DEFAULT_DATABASE,
        help="JSON database path (default: data/tickets.json)",
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    add_parser = subparsers.add_parser("add", help="create a ticket")
    add_parser.add_argument("title", help="ticket title")
    add_parser.add_argument(
        "--priority",
        choices=[priority.value for priority in Priority],
        default=Priority.MEDIUM.value,
    )

    list_parser = subparsers.add_parser("list", help="list tickets")
    list_parser.add_argument(
        "--status",
        choices=[status.value for status in Status],
        help="filter tickets by status",
    )
    list_parser.add_argument(
        "--owner",
        help="filter tickets by owner",
    )

    assign_parser = subparsers.add_parser("assign", help="assign a ticket")
    assign_parser.add_argument("ticket_id", type=int)
    assign_parser.add_argument("owner")

    close_parser = subparsers.add_parser("close", help="close a ticket")
    close_parser.add_argument("ticket_id", type=int)
    return parser


def format_ticket(ticket: Ticket) -> str:
    """Format one ticket for terminal output."""

    owner = ticket.owner or "unassigned"
    return (
        f"#{ticket.id} [{ticket.status.value}] [{ticket.priority.value}] "
        f"{ticket.title} (owner: {owner})"
    )


def main(argv: Sequence[str] | None = None) -> int:
    """Run a TeamFlow command and return its process exit code."""

    args = build_parser().parse_args(argv)
    service = TicketService(JsonTicketRepository(args.db))

    try:
        if args.command == "add":
            ticket = service.create(args.title, Priority(args.priority))
            print(f"created {format_ticket(ticket)}")
        elif args.command == "list":
            status = Status(args.status) if args.status else None
            tickets = service.list(status=status, owner=args.owner)
            if not tickets:
                print("no tickets")
            for ticket in tickets:
                print(format_ticket(ticket))
        elif args.command == "assign":
            ticket = service.assign(args.ticket_id, args.owner)
            print(f"assigned {format_ticket(ticket)}")
        elif args.command == "close":
            ticket = service.close(args.ticket_id)
            print(f"closed {format_ticket(ticket)}")
    except (TicketNotFoundError, ValueError) as error:
        print(f"error: {error}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

