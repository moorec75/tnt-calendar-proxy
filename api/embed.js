module.exports = async (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");

  // Optional: allow embedding anywhere (Wix uses an iframe)
  // If you later want to restrict this to only your Wix domain, tell me and we’ll lock it down.
  res.setHeader("X-Frame-Options", "ALLOWALL");

  res.status(200).send(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>TNT Schedule</title>

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.15/index.global.min.css">
    <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.15/index.global.min.js"></script>

    <style>
      body { margin: 0; padding: 12px; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; }
      #status { margin-bottom: 8px; }
      #calendar { max-width: 1100px; margin: 0 auto; }
    </style>
  </head>
  <body>
    <div id="status">Loading schedule…</div>
    <div id="calendar"></div>

    <script>
      (async function () {
        const statusEl = document.getElementById("status");

        try {
          const res = await fetch("/api/calendar", { cache: "no-store" });
          if (!res.ok) throw new Error("HTTP " + res.status);
          const events = await res.json();

          statusEl.textContent = "Loaded " + events.length + " events";

          const calendar = new FullCalendar.Calendar(document.getElementById("calendar"), {
            initialView: "dayGridMonth",
            height: "auto",
            fixedWeekCount: false,
            nowIndicator: true,

            // ✅ your requirement
            dayMaxEventRows: 4,
            eventDisplay: "block",

            headerToolbar: {
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,listWeek"
            },

            events
          });

          calendar.render();
        } catch (e) {
          statusEl.textContent = "ERROR loading calendar: " + (e && e.message ? e.message : e);
        }
      })();
    </script>
  </body>
</html>`);
};
