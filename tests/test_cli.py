"""Tests for TeamFlow terminal behavior."""

from __future__ import annotations

import contextlib
import io
import tempfile
import unittest
from pathlib import Path

from teamflow.cli import main


class CliTest(unittest.TestCase):
    """Exercise user-visible command output."""

    def test_add_then_list(self) -> None:
        """A created ticket appears in list output."""

        with tempfile.TemporaryDirectory() as directory:
            database = Path(directory) / "tickets.json"
            add_output = io.StringIO()
            with contextlib.redirect_stdout(add_output):
                add_code = main(
                    [
                        "--db",
                        str(database),
                        "add",
                        "修复结算错误",
                        "--priority",
                        "high",
                    ]
                )

            list_output = io.StringIO()
            with contextlib.redirect_stdout(list_output):
                list_code = main(["--db", str(database), "list"])

        self.assertEqual(0, add_code)
        self.assertEqual(0, list_code)
        self.assertIn("created #1", add_output.getvalue())
        self.assertIn("修复结算错误", list_output.getvalue())
        self.assertIn("[high]", list_output.getvalue())

    def test_missing_ticket_returns_failure_code(self) -> None:
        """Domain failures are reported as non-zero process results."""

        with tempfile.TemporaryDirectory() as directory:
            database = Path(directory) / "tickets.json"
            output = io.StringIO()
            with contextlib.redirect_stdout(output):
                result = main(["--db", str(database), "close", "99"])

        self.assertEqual(1, result)
        self.assertIn("ticket 99 was not found", output.getvalue())


if __name__ == "__main__":
    unittest.main()

