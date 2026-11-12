#!/usr/bin/env python3
"""Check the published language routes and localized content links."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.lang = None
        self.links = []
        self.images = []
        self.feed(Path(path).read_text(encoding="utf-8"))

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "html":
            self.lang = attrs.get("lang")
        if tag == "img" and "src" in attrs:
            self.images.append(attrs["src"])
        if tag == "a" and "href" in attrs:
            self.links.append(attrs)


def targets(page, base):
    return {urlparse(urljoin(base, link["href"])).path for link in page.links}


de = Page("public/about/index.html")
en = Page("public/en/events/index.html")
assert de.lang == "de" and en.lang == "en"
assert "/en/about/" in targets(de, "https://example.org/about/")
assert "/events/" in targets(en, "https://example.org/en/events/")
assert "/en/contact/" in targets(en, "https://example.org/en/events/")
seminar_target = "/en/ccc/chaosseminar/" if Path("public/en/ccc/chaosseminar/index.html").exists() else "/ccc/chaosseminar/"
seminar_links = [link for link in en.links if urlparse(urljoin("https://example.org/en/events/", link["href"])).path.rstrip("/") == seminar_target.rstrip("/")]
assert seminar_links, seminar_target
assert all((link.get("hreflang") == "de") == (seminar_target == "/ccc/chaosseminar/") for link in seminar_links)
assert not Path("public/sensors/index.html").exists()
assert not Path("public/en/sensors/index.html").exists()

contact = Page("public/en/contact/index.html")
for image in contact.images:
    url = urlparse(urljoin("https://example.org/en/contact/", image))
    if url.netloc == "example.org":
        assert (Path("public") / url.path.lstrip("/")).exists(), url.path
