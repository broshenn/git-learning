"""JSON persistence for TeamFlow tickets."""

from __future__ import annotations

import json
from pathlib import Path

from teamflow.models import Ticket


class JsonTicketRepository:
    """Store tickets in a small local JSON database."""

    def __init__(self, path: Path) -> None:
        """Initialize the repository.

        Args:
            path: JSON file used for durable storage.
        """

        self.path = path

    def load(self) -> list[Ticket]:
        """Load every ticket, returning an empty list for a new database."""

        if not self.path.exists():
            return []
        raw_data = json.loads(self.path.read_text(encoding="utf-8"))
        return [Ticket.from_dict(item) for item in raw_data]

    def save(self, tickets: list[Ticket]) -> None:
        """Persist all tickets with an atomic file replacement."""

        self.path.parent.mkdir(parents=True, exist_ok=True)
        temporary_path = self.path.with_suffix(f"{self.path.suffix}.tmp")
        payload = [ticket.to_dict() for ticket in tickets]
        temporary_path.write_text(
            json.dumps(payload, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        temporary_path.replace(self.path)

