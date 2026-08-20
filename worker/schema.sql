CREATE TABLE IF NOT EXISTS hits (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  ts       TEXT NOT NULL,
  asn      INTEGER,
  org      TEXT,
  country  TEXT,
  region   TEXT,
  city     TEXT,
  path     TEXT,
  referrer TEXT,
  ua       TEXT
);
CREATE INDEX IF NOT EXISTS hits_ts  ON hits(ts);
CREATE INDEX IF NOT EXISTS hits_org ON hits(org);
