FROM ghcr.io/gohugoio/hugo:v0.169.0@sha256:a146e0639230bbc73358e6563240f0a6103466f0390b80a457c775068ec802a9
USER root
RUN apk add --no-cache bash python3 py3-pip nodejs && python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:${PATH}"
COPY requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt
WORKDIR /site
ENTRYPOINT []
CMD ["hugo", "server", "--bind", "0.0.0.0"]
