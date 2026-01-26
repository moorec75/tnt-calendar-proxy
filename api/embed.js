module.exports = async (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
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
      /* ---- GLOBAL BACKGROUND ---- */
      html, body {
        background: #ffffff;
        margin: 0;
        padding: 0;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial;
      }

      #calendar {
        max-width: 1100px;
        margin: 0 auto;
        background: #ffffff;
      }

      /* ---- CALENDAR GRID BACKGROUND ---- */
      .fc,
      .fc-view-harness,
      .fc-scrollgrid,
      .fc-scrollgrid-section-body,
      .fc-daygrid-body,
      .fc-daygrid {
        background: #ffffff !important;
      }

      /* ---- EVENT STYLING ---- */
      .fc-daygrid-event {
        background-color: #FFEBFF !important;
        border: 1px solid #e0bfe0 !important;
        color: #000000 !important;
        border-radius: 6px;
        padding: 2px 4px;
      }

      /* ---- REMOVE TIME TEXT ---- */
      .fc-event-time {
        display: none !important;
      }

      /* ---- "+ MORE" LINK CLEANUP ---- */
      .fc-daygrid-more-link {
        color: #555;
        font-weight: 500;
      }
    </style>
  </head>

  <body>
    <div id="calendar"></div>

    <script>
      (async function () {
        try {
          const res = await fetch("/api/calendar", { cache: "no-store" });
          if (!res.ok) throw new Error("HTTP " + res.status);
          const events = await res.json();

          const calendar = new FullCalendar.Calendar(document.getElementById("calendar"), {
            initialView: "dayGridMonth",
            height: "auto",
            fixedWeekCount: false,
            nowIndicator: false,

            /* ---- YOUR RULE ---- */
            dayMaxEventRows: 4,
            eventDisplay: "block",

            headerToolbar: {
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,listWeek"
            },

            /* ---- FORCE ALL-DAY DISPLAY ---- */
            events: events.map(e => ({
              ...e,
              allDay: true
            }))
          });

          calendar.render();
        } catch (e) {
          document.body.innerHTML =
            "<div style='padding:12px;font-family:system-ui;color:red'>ERROR loading calendar</div>";
        }
      })();
    </script>
  </body>
</html>`);
};
