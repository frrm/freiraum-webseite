#!/usr/bin/env python3
"""Check RSS routes, XML, canonical metadata, and localized alternates."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
import xml.etree.ElementTree as ET


class Head(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.in_head = False
        self.links = []
        self.meta = []
        self.feed(Path(path).read_text(encoding="utf-8"))

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "head":
            self.in_head = True
        elif self.in_head and tag == "link":
            self.links.append(attrs)
        elif self.in_head and tag == "meta":
            self.meta.append(attrs)

    def handle_endtag(self, tag):
        if tag == "head":
            self.in_head = False


root = Path("public")
expected_feeds = {"post/index.xml", "en/post/index.xml"}
feeds = {path.relative_to(root).as_posix(): path for path in root.rglob("*.xml")
         if not path.relative_to(root).parts[0] == "feeds"
         if path.read_text(encoding="utf-8").lstrip().startswith("<?xml")
         and "<rss " in path.read_text(encoding="utf-8")[:300]}
assert set(feeds) == expected_feeds, feeds
for relative, path in feeds.items():
    xml = ET.parse(path).getroot()
    assert xml.tag == "rss"
    channel = xml.find("channel")
    assert channel is not None
    expected_lang = "en" if relative.startswith("en/") else "de"
    assert channel.findtext("language") == expected_lang
    assert urlparse(channel.findtext("link")).path == "/" + relative.removesuffix("index.xml")
    if expected_lang == "de":
        assert channel.findall("item")

assert not (root / "index.xml").exists()
assert not (root / "ccc/index.xml").exists()

for relative, feed_path in (("about/index.html", "/post/index.xml"),
                            ("en/about/index.html", "/en/post/index.xml")):
    head = Head(root / relative)
    canonical = [link["href"] for link in head.links if link.get("rel") == "canonical"]
    assert len(canonical) == 1 and urlparse(canonical[0]).path == "/" + relative.removesuffix("index.html")
    feed_links = [link for link in head.links if link.get("type") == "application/rss+xml"]
    assert len(feed_links) == 1 and urlparse(feed_links[0].get("href", "")).path == feed_path
    assert all(link.get("href") for link in head.links)
    properties = {meta.get("property"): meta.get("content") for meta in head.meta}
    assert properties["og:url"] == canonical[0]
    assert properties["og:title"] and properties["og:description"]
    alternates = {link.get("hreflang"): urlparse(link.get("href", "")).path
                  for link in head.links if link.get("hreflang")}
    assert alternates == {"de": "/about/", "en": "/en/about/"}

ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9",
      "xhtml": "http://www.w3.org/1999/xhtml"}
for relative, about_path in (("de/sitemap.xml", "/about/"),
                             ("en/sitemap.xml", "/en/about/")):
    sitemap = ET.parse(root / relative).getroot()
    urls = sitemap.findall("sm:url", ns)
    locs = {url.findtext("sm:loc", namespaces=ns) for url in urls}
    assert any(urlparse(loc).path == about_path for loc in locs)
    assert all(link.get("href") for link in sitemap.findall(".//xhtml:link", ns))
    about = next(url for url in urls if urlparse(url.findtext("sm:loc", namespaces=ns)).path == about_path)
    alternates = {link.get("hreflang"): urlparse(link.get("href", "")).path
                  for link in about.findall("xhtml:link", ns)}
    assert alternates == {"de": "/about/", "en": "/en/about/"}
