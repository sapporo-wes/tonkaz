FROM debian:stretch-slim

LABEL org.opencontainers.image.authors="@suecharo <suehiro619@gmail.com>"
LABEL org.opencontainers.image.url="https://github.com/sapporo-wes/tonkaz"
LABEL org.opencontainers.image.source="https://github.com/sapporo-wes/tonkaz/blob/main/Dockerfile"
LABEL org.opencontainers.image.version="0.2.4"
LABEL org.opencontainers.image.description="CLI tool to verify workflow reproducibility"
LABEL org.opencontainers.image.licenses="Apache2.0"

ADD https://github.com/sapporo-wes/tonkaz/releases/latest/download/tonkaz_x86_64-unknown-linux-gnu /usr/bin/tonkaz
RUN chmod +x /usr/bin/tonkaz

WORKDIR /app

ENTRYPOINT ["tonkaz"]
CMD [""]