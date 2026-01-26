module.exports = async (req, res) => {
  // Content type for HTML
  res.setHeader("Content-Type", "text/html; charset=utf-8");

  // Allow embedding in an iframe (Wix)
  res.setHeader("X-Frame-Options", "ALLOWALL");

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>TNT Schedule</title>

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.15/index.global.min.css">
    <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.15/index.global.min.js"></script>

    <style>
      html, body {
        margin: 0;
        padding: 0;
        background: #ffffff;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial;
      }

      #calendar {
        max-width: 1100px;
        margin: 0 auto;
        background: #ffffff;
        padding: 12px;
      }

      .fc,
      .fc-view-harness,
      .fc-scrollgrid,
      .fc-scrollgrid-section,
      .fc-scrollgrid-section-body,
      .fc-daygrid-body,
      .fc-daygrid,
      .fc-daygrid-day-frame {
        background: #ffffff !important;
      }

      /* Default event styling (ED) */
      .fc-daygrid-event {
        background-color: #FFADFF !important;
        border: 1px solid #e08be0 !important;
        color: #4B0D3A !important;
        border-radius: 6px;
        padding: 2px 6px;
        font-weight: 500;
      }
      .fc-event-title { color: #4B0D3A !important; }

      /* Hide time */
      .fc-event-time { display: none !important; }

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

          const calendar = new FullCalendar.Calendar(
            document.getElementById("calendar"),
            {
              initialView: "dayGridMonth",
              height: "auto",
              fixedWeekCount: false,
              nowIndicator: false,

              dayMaxEventRows: 4,
              eventDisplay: "block",

              headerToolbar: {
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth"
              },

              events: events.map(e => {
                const title = (e.title || "").trim();

                // Option 3: Title parsing for IP
                // - Matches "IP ..." at the start
                // - Or standalone "IP" anywhere in the title
                const isIP =
                  /^IP\\b/i.test(title) ||
                  /\\bIP\\b/i.test(title);

                return {
                  ...e,
                  allDay: true,

                  // Default (ED) uses CSS.
                  // Override only for IP:
                  ...(isIP ? { backgroundColor: "#AFACFB" } : {})
                };
              })
            }
          );

          calendar.render();
        } catch (err) {
          document.body.innerHTML =
            "<div style='padding:12px;color:red;font-family:system-ui'>ERROR loading calendar</div>";
        }
      })();
    </script>
  </body>
</html>`;

  res.statusCode = 200;
  res.end(html);
};
