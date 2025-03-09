# use minimal base image
FROM alpine:latest

# install run tools
RUN apk add --no-cache gcc             # C compiler
RUN apk add --no-cache g++             # C++ compiler
RUN apk add --no-cache python3         # Python compiler
RUN apk add --no-cache openjdk11-jre   # Java runtime
RUN apk add --no-cache bash            # Shell for scripting
RUN apk add --no-cache coreutils       # Basic utilities (e.g., timeout)

# set up non-root user
RUN adduser -D judge
USER judge
WORKDIR /home/judge

# copy the entrypoint script
COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
