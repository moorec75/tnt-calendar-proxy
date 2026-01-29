module.exports = async (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("X-Frame-Options", "ALLOWALL");

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>TNT Schedule</title>
  <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.15/index.global.min.js"></script>
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #fff;
      color: #080808;
    }
    #page-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      max-width: 1100px;
      margin: 0 auto;
    }
    #header-section {
      flex: 0 0 auto;
      background: #fff;
      padding: 8px;
    }
    #calendar-scroll {
      flex: 1 1 auto;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 0 8px 8px 8px;
      min-height: 0;
    }
    /* Custom toolbar */
    .custom-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2px;
    }
    .toolbar-left {
      display: flex;
      gap: 4px;
    }
    .toolbar-center {
      font-size: 1.1rem;
      font-weight: 600;
      color: #080808;
      text-align: center;
      margin-top: -4px;
    }
    .toolbar-right {
      display: flex;
    }
    .toolbar-btn {
      background-color: #48B0D3;
      border: 1px solid #48B0D3;
      color: #fff;
      padding: 6px 12px;
      font-size: 0.85rem;
      height: 32px;
      border-radius: 4px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .toolbar-btn:hover {
      background-color: #3a9bc0;
      border-color: #3a9bc0;
    }
    .calendar-subtitle {
      text-align: center;
      margin: 0;
      padding: 2px 0;
      font-size: 0.85rem;
      font-weight: 500;
      color: #666;
    }
    /* Hide FullCalendar's built-in toolbar */
    .fc .fc-toolbar { display: none !important; }

    /* ===== DEFAULT = ED ===== */
    .fc-daygrid-event {
      background-color: #FFADFF !important;
      border: 1px solid #e08be0 !important;
      border-radius: 4px;
      padding: 2px 4px;
      font-weight: 500;
      cursor: default;
      font-size: 11px;
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

    .fc-day-today {
      background-color: #FFEBFF !important;
    }

    /* Mobile responsive */
    @media (max-width: 500px) {
      #header-section {
        padding: 4px;
      }
      #calendar-scroll {
        padding: 0 4px 4px 4px;
      }
      .toolbar-btn {
        padding: 4px 8px;
        font-size: 0.7rem;
        height: 28px;
      }
      .toolbar-center {
        font-size: 0.9rem;
      }
      .toolbar-left {
        gap: 2px;
      }
      .calendar-subtitle {
        font-size: 0.65rem;
      }
      .fc-daygrid-event {
        font-size: 9px;
        padding: 1px 2px;
        line-height: 1.2;
      }
      .fc-daygrid-event.single-day {
        margin-left: auto;
        width: fit-content;
        max-width: 90%;
      }
      .fc-daygrid-day-number {
        font-size: 0.7rem;
        padding: 2px !important;
      }
      .fc .fc-col-header-cell-cushion {
        font-size: 0.65rem;
        padding: 4px 0;
      }
      .fc .fc-daygrid-day-frame {
        min-height: 50px;
      }
      .fc .fc-daygrid-more-link {
        font-size: 9px;
      }
    }
  </style>
</head>
<body>
  <div id="page-container">
    <div id="header-section">
      <div class="custom-toolbar">
        <div class="toolbar-left">
          <button class="toolbar-btn" id="btn-prev">&lt;</button>
          <button class="toolbar-btn" id="btn-next">&gt;</button>
        </div>
        <div class="toolbar-center" id="toolbar-title"></div>
        <div class="toolbar-right">
          <button class="toolbar-btn" id="btn-today">today</button>
        </div>
      </div>
    </div>
    <div id="calendar-scroll">
      <div id="calendar"></div>
    </div>
  </div>
  <script>
    (async function () {
      try {
        const res = await fetch("/api/calendar", { cache: "no-store" });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const events = await res.json();

        function classify(titleRaw) {
          const title = (titleRaw || "").trim();
          const prefix = title.replace(/^[^A-Za-z]+/, "").slice(0, 2).toUpperCase();
          if (prefix === "ED") return "ed";
          if (prefix === "IP") return "ip";
          return "other";
        }

        const calendarEl = document.getElementById("calendar");
        const titleEl = document.getElementById("toolbar-title");

        const calendar = new FullCalendar.Calendar(calendarEl, {
          initialView: "dayGridMonth",
          headerToolbar: false,
          height: "auto",
          fixedWeekCount: false,
          nowIndicator: false,
          dayMaxEventRows: 4,
          eventDisplay: "block",
          eventOrder: "tntOrder,title",
          handleWindowResize: true,
          datesSet: function() {
            titleEl.textContent = calendar.view.title;
          },
          events: events.map(e => {
            const startStr = typeof e.start === "string" ? e.start : "";
            const endStr = typeof e.end === "string" ? e.end : "";
            const startDate = startStr ? startStr.slice(0, 10) : null;
            let endDate = endStr ? endStr.slice(0, 10) : null;

            if (startDate && (!endDate || endDate === startDate)) {
              const d = new Date(startDate + "T00:00:00");
              d.setDate(d.getDate() + 1);
              endDate = d.toISOString().slice(0, 10);
            }

            const bucket = classify(e.title);
            const tntOrder = bucket === "ip" ? 0 : bucket === "ed" ? 1 : 2;

            // Check if single-day event (less than 25 hours)
            const startMs = new Date(startDate + "T00:00:00").getTime();
            const endMs = new Date(endDate + "T00:00:00").getTime();
            const durationHours = (endMs - startMs) / (1000 * 60 * 60);
            const isSingleDay = durationHours <= 25;

            return {
              ...e,
              allDay: true,
              start: startDate || e.start,
              end: endDate || e.end,
              classNames: isSingleDay ? [bucket, 'single-day'] : [bucket],
              tntOrder
            };
          })
        });

        calendar.render();
        titleEl.textContent = calendar.view.title;

        document.getElementById('btn-prev').addEventListener('click', function() {
          calendar.prev();
        });
        document.getElementById('btn-next').addEventListener('click', function() {
          calendar.next();
        });
        document.getElementById('btn-today').addEventListener('click', function() {
          calendar.today();
        });
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
