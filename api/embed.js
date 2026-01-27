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

    /* ===== DEFAULT = ED ===== */
    .fc-daygrid-event {
      background-color: #FFADFF !important;
      border: 1px solid #e08be0 !important;
      border-radius: 6px;
      padding: 2px 6px;
      font-weight: 500;
    }
    .fc-daygrid-event .fc-event-title {
      color: #4B0D3A !important;
    }

    /* ===== IP ===== */
    .fc-daygrid-event.ip {
      background-color: #AFACFB !important;
      border-color: #8E8AE6 !important;
    }
    .fc-daygrid-event.ip .fc-event-title {
      color: #4B0D3A !important;
    }

    /* ===== OTHER (red + white) ===== */
    .fc-daygrid-event.other {
      background-color: #D11A2A !important;
      border-color: #B01522 !important;
    }
    .fc-daygrid-event.other .fc-event-title {
      color: #FFFFFF !important;
    }

    /* Hide time */
    .fc-event-time {
      display: none !important;
    }

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

        // Take the first two LETTERS after stripping any leading non-letters (emoji, [, (, etc.)
        const prefix = title.replace(/^[^A-Za-z]+/, "").slice(0, 2).toUpperCase();

        if (prefix === "ED") return "ed";
        if (prefix === "IP") return "ip";
        return "other";
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

          // IP on top (lowest number sorts first)
          eventOrder: "tntOrder,title",

          headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth"
          },

          events: events.map(e => {
            // Convert to date-only strings to prevent timezone day-shift
            const startStr = typeof e.start === "string" ? e.start : "";
            const endStr = typeof e.end === "string" ? e.end : "";

            const startDate = startStr ? startStr.slice(0, 10) : null; // "YYYY-MM-DD"
            let endDate = endStr ? endStr.slice(0, 10) : null;

            // FullCalendar all-day end is exclusive. If end is missing or same-day, bump by 1 day.
            if (startDate && (!endDate || endDate === startDate)) {
              const d = new Date(startDate + "T00:00:00");
              d.setDate(d.getDate() + 1);
              endDate = d.toISOString().slice(0, 10);
            }

            const bucket = classify(e.title); // "ed" | "ip" | "other"
            const tntOrder = bucket === "ip" ? 0 : bucket === "ed" ? 1 : 2;

            return {
              ...e,
              allDay: true,
              start: startDate || e.start,
              end: endDate || e.end,
              classNames: [bucket],
              tntOrder
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
