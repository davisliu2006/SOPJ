# use minimal base image
FROM alpine:latest

# install run tools
RUN apk add --no-cache gcc             # C compiler
RUN apk add --no-cache g++             # C++ compiler
RUN apk add --no-cache openjdk11       # Java compiler
RUN apk add --no-cache bash            # Shell for scripting
RUN apk add --no-cache coreutils       # Basic utilities (e.g., timeout)

# copy the entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# set up non-root user
RUN adduser -D judge
USER judge
WORKDIR /home/judge

ENTRYPOINT ["/entrypoint.sh"]
