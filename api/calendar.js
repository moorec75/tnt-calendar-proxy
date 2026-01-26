import ical from "node-ical";

let cache = { ts: 0, events: [] };
const CACHE_MS = 60 * 1000; // 60 seconds cache

export default async function handler(req, res) {
  try {
    const ICS_URL = process.env.ICS_URL;
    if (!ICS_URL) {
      res.status(500).json({ error: "Missing ICS_URL" });
      return;
    }

=======
    if (!ICS_URL) {
      res.status(500).json({ error: "Missing ICS_URL" });
      return;
    }
>>>>>>> 20b5903 (Initial calendar proxy)

    const now = Date.now();
    if (now - cache.ts < CACHE_MS && cache.events.length) {
      res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
<<<<<<< HEAD
      return res.status(200).json(cache.events);
=======
      res.status(200).json(cache.events);
      return;
>>>>>>> 20b5903 (Initial calendar proxy)
    }

    const data = await ical.async.fromURL(ICS_URL, {
      headers: { "User-Agent": "tnt-calendar-proxy/1.0" },
      timeout: 10000,
    });

    const events = [];
    for (const k of Object.keys(data)) {
      const e = data[k];
      if (!e || e.type !== "VEVENT") continue;
      if (e.status && String(e.status).toUpperCase() === "CANCELLED") continue;

      events.push({
        id: e.uid || k,
        title: e.summary || "Busy",
        start: e.start?.toISOString(),
        end: (e.end || e.start)?.toISOString(),
        allDay: !!e.datetype || false,
      });
    }

    cache = { ts: now, events };
<<<<<<< HEAD
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    return res.status(200).json(events);
  } catch {
    return res.status(500).json({ error: "Failed to load calendar feed" });
=======

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ error: "Failed to load calendar feed" });
>>>>>>> 20b5903 (Initial calendar proxy)
  }
}
