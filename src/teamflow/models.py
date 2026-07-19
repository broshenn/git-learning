"""Domain models used by TeamFlow."""

from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from enum import StrEnum
from typing import Any


class Priority(StrEnum):
    """Supported ticket priorities."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Status(StrEnum):
    """Supported ticket lifecycle states."""

    OPEN = "open"
    CLOSED = "closed"


@dataclass(slots=True)
class Ticket:
    """A unit of work tracked by the team."""

    id: int
    title: str
    priority: Priority
    status: Status = Status.OPEN
    owner: str | None = None
    created_at: str = ""

    @classmethod
    def create(cls, ticket_id: int, title: str, priority: Priority) -> Ticket:
        """Create a new ticket with a UTC timestamp.

        Args:
            ticket_id: Repository-allocated positive identifier.
            title: Short description of the work.
            priority: Business priority of the ticket.

        Returns:
            A new open ticket.
        """

        return cls(
            id=ticket_id,
            title=title,
            priority=priority,
            created_at=datetime.now(timezone.utc).isoformat(),
        )

    def to_dict(self) -> dict[str, Any]:
        """Serialize the ticket into JSON-compatible values."""

        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Ticket:
        """Restore a ticket from persisted JSON data."""

        return cls(
            id=int(data["id"]),
            title=str(data["title"]),
            priority=Priority(data["priority"]),
            status=Status(data["status"]),
            owner=data.get("owner"),
            created_at=str(data["created_at"]),
        )

