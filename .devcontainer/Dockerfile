FROM mcr.microsoft.com/devcontainers/base:ubuntu24.04

COPY --from=oven/bun:1.4.5 /usr/local/bin/bun /usr/local/bin/bun
RUN ln -s /usr/local/bin/bun /usr/local/bin/bunx
