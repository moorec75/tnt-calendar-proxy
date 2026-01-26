module.exports = async (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
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

      /* Default event styling = ED */
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

          function classify(titleRaw) {
            const title = (titleRaw || "").trim();

            // Match whole-word ED/IP (avoids "Med" triggering ED, etc.)
            const isED = /\\bED\\b/i.test(title);
            const isIP = /\\bIP\\b/i.test(title);

            if (isED) return "ED";
            if (isIP) return "IP";
            return "OTHER";
          }

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
                const bucket = classify(e.title);

                // Default ED uses CSS; we only override when needed.
                if (bucket === "IP") {
                  return {
                    ...e,
                    allDay: true,
                    backgroundColor: "#AFACFB",
                    borderColor: "#8E8AE6",
                    textColor: "#4B0D3A"
                  };
                }

                if (bucket === "OTHER") {
                  return {
                    ...e,
                    allDay: true,
                    backgroundColor: "#D11A2A",
                    borderColor: "#B01522",
                    textColor: "#FFFFFF"
                  };
                }

                // ED (default)
                return { ...e, allDay: true };
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
