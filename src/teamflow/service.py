"""Business operations for TeamFlow."""

from __future__ import annotations

from teamflow.models import Priority, Status, Ticket
from teamflow.repository import JsonTicketRepository


class TicketNotFoundError(LookupError):
    """Raised when a ticket identifier does not exist."""


class TicketService:
    """Coordinate ticket validation and persistence."""

    def __init__(self, repository: JsonTicketRepository) -> None:
        """Initialize the service with a persistence adapter."""

        self.repository = repository

    def create(self, title: str, priority: Priority) -> Ticket:
        """Create and persist a ticket.

        Args:
            title: Short description with at least three characters.
            priority: Business priority.

        Returns:
            The persisted ticket.

        Raises:
            ValueError: If the title is too short.
        """

        normalized_title = title.strip()
        if len(normalized_title) < 3:
            raise ValueError("title must contain at least 3 characters")

        tickets = self.repository.load()
        next_id = max((ticket.id for ticket in tickets), default=0) + 1
        ticket = Ticket.create(next_id, normalized_title, priority)
        tickets.append(ticket)
        self.repository.save(tickets)
        return ticket

    def list(
        self,
        status: Status | None = None,
        owner: str | None = None,
    ) -> list[Ticket]:
        """Return tickets, optionally filtered by status and owner."""

        tickets = self.repository.load()
        if status is not None:
            tickets = [ticket for ticket in tickets if ticket.status == status]
        if owner is not None:
            normalized_owner = owner.strip()
            tickets = [
                ticket for ticket in tickets if ticket.owner == normalized_owner
            ]
        return tickets

    def assign(self, ticket_id: int, owner: str) -> Ticket:
        """Assign a ticket to a team member."""

        normalized_owner = owner.strip()
        if not normalized_owner:
            raise ValueError("owner cannot be empty")

        tickets = self.repository.load()
        ticket = self._find(tickets, ticket_id)
        ticket.owner = normalized_owner
        self.repository.save(tickets)
        return ticket

    def close(self, ticket_id: int) -> Ticket:
        """Close an existing ticket."""

        tickets = self.repository.load()
        ticket = self._find(tickets, ticket_id)
        ticket.status = Status.CLOSED
        self.repository.save(tickets)
        return ticket

    @staticmethod
    def _find(tickets: list[Ticket], ticket_id: int) -> Ticket:
        """Find a ticket by identifier or raise a domain error."""

        for ticket in tickets:
            if ticket.id == ticket_id:
                return ticket
        raise TicketNotFoundError(f"ticket {ticket_id} was not found")

