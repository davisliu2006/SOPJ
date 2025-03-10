#!/bin/sh
# set resource limits
ulimit -t 1          # time limit (1s)
ulimit -m 262144     # memory limit (256 MB)
ulimit -f 1024       # file size limit (1 MB)

# execute the user's code
cd /home/judge
case "$1" in
    c)
        touch main.c
        printf "%s" "$2" > main.c
        gcc main.c -o main && ./main
        ;;
    cpp)
        touch main.cpp
        printf "%s" "$2" > main.cpp
        g++ main.cpp -o main && ./main
        ;;
    python)
        touch main.py
        printf "%s" "$2" > main.py
        python3 ./main.py
        ;;
    java)
        touch Main.java
        printf "%s" "$2" > Main.java
        javac Main.java && java -cp Main
        ;;
    *)
        echo "Unsupported language"
        exit 1
        ;;
esac