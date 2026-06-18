# Z.ai Sandbox Command Reference

> **Platform:** Linux x86_64 (Debian-based)
> **Kernel:** 5.10.134
> **Shell:** GNU Bash 5.2.37
> **Total commands:** 1321
> **Date compiled:** 2026-05-13

---

## Table of Contents

1. [File Operations](#1-file-operations)
2. [Viewing and Searching Files](#2-viewing-and-searching-files)
3. [Text Search and Filtering](#3-text-search-and-filtering)
4. [Text Processing](#4-text-processing)
5. [Archiving and Compression](#5-archiving-and-compression)
6. [Network and Internet](#6-network-and-internet)
7. [System and Processes](#7-system-and-processes)
8. [Users and Permissions](#8-users-and-permissions)
9. [Disks and File Systems](#9-disks-and-file-systems)
10. [System Services (systemd)](#10-system-services-systemd)
11. [Python and Ecosystem](#11-python-and-ecosystem)
12. [Node.js / JavaScript / TypeScript](#12-nodejs--javascript--typescript)
13. [Java](#13-java)
14. [Perl](#14-perl)
15. [C/C++ and Build Tools](#15-cc-and-build-tools)
16. [Git - Version Control](#16-git---version-control)
17. [Documents and Conversion](#17-documents-and-conversion)
18. [Graphics, Video, Images](#18-graphics-video-images)
19. [Maps and Geodata (GDAL/OGR)](#19-maps-and-geodata-gdalogr)
20. [Data and Formats](#20-data-and-formats)
21. [Web Servers and API](#21-web-servers-and-api)
22. [Databases](#22-databases)
23. [Editors](#23-editors)
24. [Special Z.ai Commands](#24-special-zai-commands)
25. [Other Useful Utilities](#25-other-useful-utilities)

---

## 1. File Operations

Commands for creating, copying, moving, deleting, and managing files and directories. These are the foundation of Linux work -- without these commands, no task can be performed.

| Command | Description | Example | When to Use |
|---------|-------------|---------|-------------|
| `ls` | Lists files and directories. Without flags - only names. With `-l` - detailed info (permissions, owner, size, date). With `-a` - shows hidden files (start with `.`). | `ls -la /home/z/` | Need to view directory contents |
| `cp` | Copies files or directories. Flag `-r` - recursive (for folders). Flag `-p` - preserves permissions and date. | `cp -r src/ backup/` | Copy a file/folder |
| `mv` | Moves or renames files/directories. Works instantly within the same file system. | `mv old.txt new.txt` | Rename or move |
| `rm` | Deletes files. Flag `-r` - recursive (for folders). Flag `-f` - force, no confirmation. **Caution: cannot be undone!** | `rm -rf temp/` | Delete files or folders |
| `mkdir` | Creates directories. Flag `-p` - creates all intermediate directories. | `mkdir -p /home/z/project/src` | Create a folder |
| `rmdir` | Deletes an empty directory. Does not work if files exist inside. | `rmdir empty_dir/` | Delete an empty folder |
| `touch` | Creates an empty file or updates the modification date of an existing file. | `touch newfile.txt` | Create an empty file |
| `ln` | Creates a link to a file. Flag `-s` - symbolic (soft) link, without flag - hard link. | `ln -s /path/target link_name` | Create a shortcut/link |
| `chmod` | Changes file permissions. Supports numeric (755) and symbolic (u+x) formats. | `chmod 755 script.sh` | Set permissions |
| `chown` | Changes file owner and group. Requires sudo for system files. | `chown user:group file.txt` | Change file owner |
| `chgrp` | Changes the group owner of a file. | `chgrp developers project/` | Change file group |
| `install` | Copies a file while setting permissions and owner. Convenient for installing scripts. | `install -m 755 script.sh /usr/local/bin/` | Install a file with proper permissions |
| `truncate` | Shrinks or extends a file to the specified size. | `truncate -s 0 log.txt` | Clear a file without deleting it |
| `link` | Creates a hard link (similar to `ln` without `-s`). | `link file.txt hardlink.txt` | Create a hard link |
| `unlink` | Removes one link to a file. If it's the last one, the file is deleted. | `unlink hardlink.txt` | Remove a link |
| `rename.ul` | Renames files by pattern (util-linux utility). | `rename.ul .txt .bak *.txt` | Bulk rename |
| `realpath` | Outputs the full absolute path, resolving all symbolic links. | `realpath ./link` | Get the real path |
| `readlink` | Shows where a symbolic link points. Flag `-f` - recursive. | `readlink -f /usr/bin/python3` | Where does the link point |
| `basename` | Extracts the file name from a full path. | `basename /home/z/file.txt` -> `file.txt` | Get just the file name |
| `dirname` | Extracts the directory path from a full path. | `dirname /home/z/file.txt` -> `/home/z` | Get just the path |
| `stat` | Shows detailed file info: size, inode, permissions, timestamps. | `stat script.sh` | Detailed file information |
| `file` | Determines file type by content, not by extension. | `file unknown_data` | What type of file is this |
| `tree` | Shows directory structure as a tree. Flag `-L 2` - depth 2 levels. | `tree -L 2 /home/z/` | Visualize folder structure |
| `which` | Shows the full path to a command's executable. | `which python3` | Where is the command located |
| `whereis` | Finds binary, sources, and man page for a command. | `whereis gcc` | Find all files related to a command |
| `du` | Shows file and directory sizes. Flag `-h` - human readable, `-s` - total. | `du -sh /home/z/` | How much space does a folder take |
| `df` | Shows disk space usage. Flag `-h` - human readable. | `df -h` | How much free disk space |
| `pathchk` | Checks file name validity and portability. | `pathchk "my file.txt"` | Check file name validity |
| `mktemp` | Creates a temporary file or directory with a unique name. | `mktemp /tmp/data.XXXXXX` | Create a safe temporary file |
| `mkfifo` | Creates a named pipe (FIFO) for inter-process communication. | `mkfifo /tmp/mypipe` | Set up a pipe between processes |

---

## 2. Viewing and Searching Files

Commands for reading file contents and finding files in the file system. Used constantly for navigation, log analysis, and finding needed data.

| Command | Description | Example | When to Use |
|---------|-------------|---------|-------------|
| `cat` | Outputs the entire file content. Not suitable for large files. With `-n` adds line numbers. | `cat config.yaml` | Read a small file |
| `head` | Outputs the first N lines of a file (default 10). Flag `-n 20` - 20 lines. | `head -n 20 log.txt` | View the beginning of a file |
| `tail` | Outputs the last N lines of a file. Flag `-f` - follow the file in real time. | `tail -f /var/log/syslog` | Monitor logs in real time |
| `less` | Paginated file viewer with scrolling, search (`/pattern`), and navigation. | `less large_file.log` | Read a large file |
| `more` | Simple paginated viewer (predecessor of `less`). No search or upward scrolling. | `more readme.txt` | Simple viewing |
| `wc` | Counts lines, words, and bytes. Flag `-l` - only lines, `-w` - words, `-c` - bytes. | `wc -l data.csv` | How many lines in a file |
| `find` | Powerful file search by name, type, size, date, permissions. Supports executing commands on found files. | `find /home -name "*.py" -mtime -7` | Find files by criteria |
| `nl` | Numbers file lines (similar to `cat -n`, but with formatting options). | `nl script.sh` | Output file with line numbers |
| `tee` | Reads from stdin and writes to both stdout and a file. Flag `-a` - append, don't overwrite. | `echo "log entry" \| tee -a log.txt` | Output and save simultaneously |
| `xargs` | Takes lines from stdin and passes them as arguments to a command. Flag `-I{}` - substitution template. | `find . -name "*.tmp" \| xargs rm` | Pipe output of one command to another |
| `od` | Outputs file content in octal, hexadecimal, or other format. | `od -x binary.dat` | View a binary file |
| `cksum` | Computes CRC checksum and file size. | `cksum data.bin` | Verify file integrity |
| `md5sum` | Computes MD5 hash of a file. Used for integrity verification. | `md5sum image.iso` | Check if file is corrupted |
| `sha256sum` | Computes SHA-256 hash. More reliable than MD5 for integrity checking. | `sha256sum archive.tar.gz` | Reliable integrity check |
| `sha512sum` | Computes SHA-512 hash. The most reliable of the family. | `sha512sum backup.tar` | Maximum integrity check |

---

## 3. Text Search and Filtering

Tools for finding text patterns in files and data streams. This is a key skill for log analysis, data processing, and debugging.

| Command | Description | Example | When to Use |
|---------|-------------|---------|-------------|
| `grep` | Searches lines by regular expression. Flag `-r` - recursive, `-i` - case insensitive, `-n` - with line numbers. | `grep -rn "ERROR" /var/log/` | Find text in files |
| `egrep` | Alias for `grep -E` - extended regular expressions (no escaping for `+`, `?`, `|`). | `egrep "error\|warn" log.txt` | Search with extended regex |
| `fgrep` | Alias for `grep -F` - fixed string search, no regex. Faster for simple search. | `fgrep "exact string" *.txt` | Fast exact string search |
| `rg` | **ripgrep** - ultra-fast grep replacement. Recursive by default, respects `.gitignore`. | `rg "TODO" --type py` | Fast search in projects |
| `sed` | Stream editor. Replace, delete, insert lines. Flag `-i` - edit file in place. | `sed -i 's/old/new/g' file.txt` | Bulk text replacement in files |
| `awk` | Text processing language. More powerful than sed - supports variables, conditions, loops. | `awk '{print $1, $3}' data.csv` | Tabular data processing |
| `mawk` | Fast AWK implementation. POSIX AWK compatible, but faster than gawk. | `mawk -F, '{sum+=$2} END{print sum}' data.csv` | Fast large file processing |
| `sort` | Sorts lines. Flag `-n` - numeric, `-r` - reverse, `-k2` - by 2nd column, `-u` - unique. | `sort -rn -k2 scores.txt` | Sort data |
| `uniq` | Removes duplicate adjacent lines. Usually used after `sort`. Flag `-c` - count occurrences. | `sort data.txt \| uniq -c \| sort -rn` | Count element frequency |
| `cut` | Cuts columns or fields from lines. Flag `-d` - delimiter, `-f` - field number. | `cut -d: -f1 /etc/passwd` | Extract a column from a table |
| `tr` | Replaces or deletes characters. Supports ranges and classes. | `tr '[:lower:]' '[:upper:]' < file.txt` | Character transformation |
| `paste` | Merges lines from multiple files horizontally. | `paste names.txt ages.txt` | Glue files by columns |
| `column` | Formats text into columns. Flag `-t` - auto alignment, `-s` - delimiter. | `column -t -s: data.txt` | Pretty table output |
| `comm` | Compares two sorted files. Columns: only in 1st, only in 2nd, in both. | `comm -23 file1.txt file2.txt` | Find unique lines |
| `join` | Merges lines from two files by a common field (similar to SQL JOIN). | `join -t, file1.csv file2.csv` | Join data from two files |
| `diff` | Compares files line by line. Flag `-u` - unified format (like in git). | `diff -u old.txt new.txt` | Find differences between files |
| `sdiff` | Shows two files side by side with difference markers. | `sdiff file1.txt file2.txt` | Side-by-side comparison |
| `diff3` | Compares three files simultaneously (for three-way merge). | `diff3 mine.txt base.txt theirs.txt` | Resolve merge conflicts |
| `cmp` | Byte-by-byte comparison of two files. Shows the first difference. | `cmp file1.bin file2.bin` | Quick identity check |
| `expand` | Replaces tabs with spaces. | `expand -t 4 code.py` | Convert tabs to spaces |
| `unexpand` | Replaces spaces with tabs. | `unexpand -t 4 code.py` | Convert spaces to tabs |
| `fmt` | Formats text by paragraph width. | `fmt -w 80 readme.txt` | Justify text width |
| `fold` | Wraps long lines to specified width. | `fold -w 72 long_text.txt` | Wrap long lines |
| `pr` | Formats text for printing: headers, page numbering, columns. | `pr -d -h "Report" data.txt` | Prepare text for printing |
| `rev` | Reverses lines character by character. | `echo "hello" \| rev` -> `olleh` | Invert text |
| `tac` | Outputs file lines in reverse order (like `cat` backwards). | `tac log.txt` | Read file bottom to top |
| `seq` | Generates a sequence of numbers. | `seq 1 10` -> 1,2,...,10 | Create a numeric sequence |
| `shuf` | Randomly permutes lines. | `shuf names.txt` | Shuffle data |
| `split` | Splits a file into parts. Flag `-l 1000` - by 1000 lines. | `split -l 1000 bigfile.csv part_` | Split a large file |
| `csplit` | Splits a file by context (by pattern, not by line count). | `csplit file.txt '/^CHAPTER/' '{*}'` | Split file by chapters |

---

## 4. Text Processing

Additional tools for formatting, analyzing, and converting text data.

| Command | Description | Example | When to Use |
|---------|-------------|---------|-------------|
| `printf` | Formatted output (like in C). Supports `%s`, `%d`, `%f`, `%x`, etc. | `printf "Name: %s, Age: %d\n" "Alice" 30` | Formatted output |
| `echo` | Outputs text to stdout. Flag `-e` - interpret escape sequences (`\n`, `\t`). | `echo -e "Line1\nLine2"` | Simple text output |
| `yes` | Repeatedly outputs a string (default "y"). Useful for automation. | `yes \| apt install pkg` | Auto-confirmation |
| `numfmt` | Converts numbers to human-readable format (KB, MB, GB). | `echo 1500000 \| numfmt --to=si` -> `1.5M` | Format numbers |
| `factor` | Factors a number into prime factors. | `factor 60` -> `60: 2 2 3 5` | Prime factorization |
| `base64` | Encodes/decodes Base64. Flag `-d` - decode. | `echo "hello" \| base64` | Encode/decode Base64 |
| `base32` | Encodes/decodes Base32. | `echo "hello" \| base32` | Encode Base32 |
| `basenc` | Encodes in various formats (base64, base32, hex, etc.). | `basenc --base64url < file` | Flexible encoding |
| `iconv` | Converts text between encodings. | `iconv -f UTF-8 -t CP1251 file.txt` | Change encoding |
| `strings` | Extracts readable strings from a binary file. | `strings binary_file` | Find text in a binary |
| `grep` | (see section 3) | | |
| `jq` | Processes JSON on the command line. Powerful selector and transformer. | `jq '.name' data.json` | Work with JSON |
| `json_pp` | Pretty-print JSON (from Perl). Simple formatter. | `json_pp < data.json` | Pretty-format JSON |
| `jsonschema` | Validates JSON against JSON Schema. | `jsonschema -i data.json schema.json` | Validate JSON against schema |
| `xml2` | Converts XML to a flat format for processing with text utilities. | `xml2 < config.xml` | Process XML as text |

---

## 5. Archiving and Compression

Tools for packing and unpacking archives. Different formats are used in different contexts: `.tar.gz` - Linux standard, `.zip` - universal, `.7z` - maximum compression.

| Command | Description | Example | When to Use |
|---------|-------------|---------|-------------|
| `tar` | Universal Linux archiver. Creates `.tar`, combines with gzip/bzip2/xz. Flag `-c` - create, `-x` - extract, `-z` - gzip, `-j` - bzip2, `-v` - verbose. | `tar -czf archive.tar.gz folder/` | Create/extract tar archive |
| `gzip` | Compresses files to `.gz` format. Original is replaced. Flag `-k` - keep original. | `gzip -k bigfile.txt` | Compress file to .gz |
| `gunzip` | Decompresses `.gz` files. | `gunzip file.txt.gz` | Decompress .gz |
| `zcat` | Outputs `.gz` file content without decompressing to disk. | `zcat log.txt.gz` | Read compressed file |
| `bzip2` | Compresses to `.bz2` - better compression than gzip, but slower. | `bzip2 -k file.txt` | Compress to .bz2 |
| `bunzip2` | Decompresses `.bz2` files. | `bunzip2 file.txt.bz2` | Decompress .bz2 |
| `xz` | Compresses to `.xz` - best compression, but slowest. | `xz -k file.txt` | Maximum compression |
| `unxz` | Decompresses `.xz` files. | `unxz file.txt.xz` | Decompress .xz |
| `lzma` | Compresses in LZMA format (predecessor of xz). | `lzma -k file.txt` | Compress to LZMA |
| `zip` | Creates `.zip` archive. Universal format for Windows/Linux/macOS. | `zip -r archive.zip folder/` | Create zip archive |
| `unzip` | Decompresses `.zip` archives. Flag `-l` - list contents without extracting. | `unzip archive.zip -d target/` | Extract zip |
| `zipinfo` | Shows detailed info about zip archive contents. | `zipinfo archive.zip` | Zip information |
| `zipcloak` | Encrypts a zip archive with a password. | `zipcloak archive.zip` | Protect zip with password |
| `zipsplit` | Splits a large zip into parts of a given size. | `zipsplit -n 1000000 big.zip` | Split zip into parts |
| `unrar` | Decompresses `.rar` archives. | `unrar x archive.rar` | Extract RAR |
| `unrar-free` | Free implementation of unrar (limited RAR5 support). | `unrar-free x archive.rar` | Extract RAR (free) |

---

## 6. Network and Internet

Commands for network operations: file downloads, connection diagnostics, DNS queries, and traffic monitoring. In the sandbox, network capabilities are limited by security policies, but basic tools work.

| Command | Description | Example | When to Use |
|---------|-------------|---------|-------------|
| `curl` | Universal HTTP client. Supports HTTP/HTTPS/FTP and dozens of other protocols. Flag `-o` - save to file, `-s` - silent mode, `-X POST` - method, `-d` - data, `-H` - headers. | `curl -s https://api.example.com/data` | HTTP requests, downloading |
| `wget` | File downloader from the internet. Better than curl for recursive site downloading. Flag `-q` - quiet, `-O` - output filename, `-c` - resume. | `wget -q https://example.com/file.zip` | Download a file |
| `ping` | Checks host availability via ICMP echo. Flag `-c 4` - 4 packets. | `ping -c 4 google.com` | Check host connectivity |
| `traceroute` | Shows the packet route to a host (all intermediate nodes). | `traceroute google.com` | Route diagnostics |
| `dig` | DNS queries. Shows IP addresses, MX records, NS, and other DNS data. | `dig example.com A` | DNS diagnostics |
| `nslookup` | Simple DNS query (deprecated but convenient). | `nslookup example.com` | Quick DNS query |
| `host` | Compact DNS query. Shorter output than dig. | `host example.com` | Get IP by domain |
| `ip` | Powerful network configuration utility (replacement for ifconfig/route). Subcommands: `addr`, `link`, `route`, `neigh`. | `ip addr show` | Network configuration and diagnostics |
| `ifconfig` | Shows/configures network interfaces (deprecated but popular). | `ifconfig eth0` | Network interface information |
| `ss` | Socket statistics (replacement for netstat). Flag `-t` - TCP, `-u` - UDP, `-l` - listening. | `ss -tlnp` | Check open ports |
| `netstat` | Shows network connections, routing tables, interface statistics. | `netstat -tlnp` | Check ports and connections |
| `arp` | Shows/manages the ARP table (IP to MAC mapping). | `arp -a` | View ARP table |
| `bridge` | Manages network bridges in Linux. | `bridge link show` | Configure network bridge |
| `rdma` | Manages RDMA connections (high-performance networks). | `rdma link show` | RDMA diagnostics |
| `nc` (netcat) | Swiss army knife for TCP/UDP. Can listen on a port, transfer data. | `nc -l 8080` | Simple TCP/UDP client/server |

---

## 7. System and Processes

Commands for monitoring and managing the operating system and running processes. Used for diagnostics, resource management, and background tasks.

| Command | Description | Example | When to Use |
|---------|-------------|---------|-------------|
| `ps` | Shows a snapshot of running processes. Flag `aux` - all processes with details. | `ps aux` | Process list |
| `top` | Interactive real-time process monitor. Shows CPU, memory, PID. | `top` | Load monitoring |
| `kill` | Sends a signal to a process. Default SIGTERM (15). Flag `-9` - SIGKILL (force). | `kill -9 12345` | Terminate a process |
| `pkill` | Kills processes by name or pattern. | `pkill -f "node server"` | Kill process by name |
| `pgrep` | Finds PIDs by process name. Flag `-f` - search in full command line. | `pgrep -f python` | Find PID |
| `pidof` | Shows PID by exact process name. | `pidof nginx` | Get PID by name |
| `pidwait` | Waits for a process to finish. | `pidwait 12345` | Wait for completion |
| `nohup` | Runs a command immune to session disconnection. Output is redirected to `nohup.out`. | `nohup python3 train.py &` | Run a process in background |
| `bg` | Resumes a suspended process in background mode. | `bg %1` | Continue task in background |
| `fg` | Brings a background process to the foreground. | `fg %1` | Return task to screen |
| `jobs` | Shows background tasks of the current session. | `jobs -l` | List background tasks |
| `wait` | Waits for a background process to finish. | `wait $PID` | Wait for completion |
| `sleep` | Pauses execution for N seconds. Supports `s`, `m`, `h`, `d`. | `sleep 5` | Pause in script |
| `watch` | Periodically runs a command, showing results in real time. | `watch -n 2 "ps aux \| grep python"` | Monitor changes |
| `time` | Measures command execution time (real, user, sys). | `time python3 script.py` | Measure performance |
| `timeout` | Runs a command with a time limit. | `timeout 60 python3 script.py` | Limit execution time |
| `nice` | Runs a process with modified priority (-20 to 19, lower = higher priority). | `nice -n 10 heavy_task.sh` | Lower task priority |
| `renice` | Changes the priority of an already running process. | `renice -n 5 -p 12345` | Change priority |
| `uname` | Shows system information. Flag `-a` - all. | `uname -a` | What system? |
| `hostname` | Shows/sets the hostname. | `hostname` | Machine name |
| `whoami` | Shows the current username. | `whoami` | Who am I? |
| `id` | Shows UID, GID, and user groups. | `id` | User identification |
| `who` | Shows logged-in users. | `who` | Who is in the system |
| `w` | Shows logged-in users and what they are doing. | `w` | Who and what are they doing |
| `uptime` | Shows system uptime and average load. | `uptime` | How long has the server been running |
| `free` | Shows RAM usage. Flag `-h` - human readable. | `free -h` | How much memory is free |
| `vmstat` | Shows virtual memory, process, and CPU statistics. | `vmstat 1 5` | Memory and CPU monitoring |
| `dmesg` | Shows kernel messages (boot, drivers, hardware errors). | `dmesg \| tail -20` | Kernel diagnostics |
| `env` | Shows environment variables. | `env` | View variables |
| `printenv` | Outputs environment variables. Can specify a specific one. | `printenv PATH` | Get variable value |
| `export` | Exports a variable to child processes. | `export MY_VAR="value"` | Set environment variable |
| `set` | Shows all shell variables and functions. | `set` | All shell variables |
| `unset` | Removes an environment variable or function. | `unset MY_VAR` | Remove variable |
| `alias` | Creates a command alias. | `alias ll='ls -la'` | Create command shortcut |
| `unalias` | Removes an alias. | `unalias ll` | Remove shortcut |
| `history` | Shows command history. | `history \| tail -20` | What did I do before? |
| `source` | Executes a script in the current shell (no new process). | `source venv/bin/activate` | Activate virtual environment |
| `date` | Shows/sets date and time. | `date +%Y-%m-%d` | Current date |
| `lsof` | Shows open files and sockets of processes. | `lsof -i :8080` | Who is using the port? |
| `pmap` | Shows the memory map of a process. | `pmap 12345` | Process memory usage |
| `slabtop` | Interactive kernel slab cache monitor. | `slabtop` | Kernel cache monitoring |
| `taskset` | Pins a process to specific CPU cores. | `taskset -c 0,1 python3 script.py` | Limit CPU for process |
| `chrt` | Changes process scheduling policy (realtime, etc.). | `chrt -f -p 50 12345` | Configure scheduling |
| `ionice` | Sets I/O priority for a process. | `ionice -c 3 cp bigfile /backup/` | Lower I/O priority |
| `flock` | Manages file locks for process synchronization. | `flock /tmp/lockfile command` | Prevent parallel access |
| `prlimit` | Shows/sets resource limits for a process. | `prlimit --nofile=1024:1024 -p 12345` | Limit process resources |

---

## 8. Users and Permissions

User, group, and access rights management. In the sandbox, most commands require root privileges.

| Command | Description | Example | When to Use |
|---------|-------------|---------|-------------|
| `su` | Switches to another user (default root). | `su - username` | Become another user |
| `sudo` | Executes a command as superuser. | `sudo apt install pkg` | Execute with root rights |
| `useradd` | Creates a new user. | `useradd -m -s /bin/bash newuser` | Create a user |
| `userdel` | Deletes a user. Flag `-r` - delete home directory. | `userdel -r olduser` | Delete a user |
| `usermod` | Modifies user parameters. | `usermod -aG docker username` | Add to group |
| `groupadd` | Creates a new group. | `groupadd developers` | Create a group |
| `groupdel` | Deletes a group. | `groupdel oldgroup` | Delete a group |
| `groupmod` | Modifies group parameters. | `groupmod -n newname oldname` | Rename a group |
| `passwd` | Changes user password. | `passwd username` | Change password |
| `groups` | Shows the groups a user belongs to. | `groups username` | Which groups is the user in |
| `chage` | Manages password expiration. | `chage -l username` | Password policy |
| `chfn` | Changes Finger information (full name, phone). | `chfn -f "John Doe"` | Update user data |
| `chsh` | Changes the login shell. | `chsh -s /bin/zsh` | Change shell |
| `newgrp` | Switches the primary group in the current session. | `newgrp docker` | Change active group |
| `sg` | Executes a command as another group. | `sg docker -c "docker ps"` | Run as group |
| `visudo` | Safely edits the sudoers file with syntax checking. | `sudo visudo` | Configure sudo rights |
| `last` | Shows login history. | `last -10` | Who logged in and when |
| `login` | Initiates a new login session. | `login username` | Log into the system |

---

## 9. Disks and File Systems

Disk partition management, file system mounting, checking, and formatting. In the sandbox, most operations are restricted.

| Command | Description | Example | When to Use |
|---------|-------------|---------|-------------|
| `mount` | Mounts a file system. | `mount /dev/sda1 /mnt/data` | Connect a disk |
| `umount` | Unmounts a file system. | `umount /mnt/data` | Disconnect a disk |
| `lsblk` | Shows block devices (disks, partitions). | `lsblk` | List disks and partitions |
| `blkid` | Shows UUID and file system type of block devices. | `blkid` | Identify partitions |
| `findmnt` | Shows mounted file systems as a tree. | `findmnt` | List mounts |
| `mkfs` | Creates a file system (formats a partition). | `mkfs.ext4 /dev/sda1` | Format a disk |
| `mkswap` | Creates a swap partition. | `mkswap /dev/sda2` | Create swap |
| `swapoff` | Disables swap. | `swapoff /dev/sda2` | Disable swap |
| `swapon` | Enables swap. | `swapon /dev/sda2` | Enable swap |
| `fsck` | Checks and repairs a file system. | `fsck /dev/sda1` | Check disk for errors |
| `fstrim` | Frees unused blocks on SSD. | `sudo fstrim -av` | Optimize SSD |
| `losetup` | Configures loop devices (mounting ISO as disk). | `losetup /dev/loop0 image.iso` | Mount ISO |
| `dd` | Byte-by-byte data copying. Caution - can erase a disk! | `dd if=image.iso of=/dev/sdb bs=4M` | Create bootable USB |
| `df` | (see section 1) | | |
| `du` | (see section 1) | | |
| `partx` | Manages partitions of a block device. | `partx -l /dev/sda` | List partitions |
| `wipefs` | Removes file system signatures (clears headers). | `wipefs -a /dev/sdb` | Clean a disk |
| `fallocate` | Reserves space for a file without writing data. | `fallocate -l 1G swapfile` | Create a file of specified size |
| `sync` | Flushes file system buffers to disk. | `sync` | Guarantee data write |

---

## 10. System Services (systemd)

Service management, logs, and system configuration through systemd - the standard init system in modern Linux distributions.

| Command | Description | Example | When to Use |
|---------|-------------|---------|-------------|
| `systemctl` | Manages systemd services. `start`, `stop`, `restart`, `status`, `enable`, `disable`. | `systemctl status nginx` | Service management |
| `journalctl` | Views systemd journal logs. Flag `-u` - by service, `-f` - follow, `--since` - from date. | `journalctl -u nginx --since today` | System logs |
| `systemd-analyze` | Analyzes boot time and service dependencies. | `systemd-analyze blame` | What slows down boot? |
| `systemd-run` | Runs a command as a temporary systemd service. | `systemd-run --unit=mytask python3 script.py` | Run as a service |
| `systemd-notify` | Sends service status notifications. | `systemd-notify --ready` | Signal readiness |
| `systemd-cat` | Redirects output to systemd journal. | `systemd-cat echo "hello"` | Write to system log |
| `systemd-cgls` | Shows the control groups (cgroups) tree. | `systemd-cgls` | Process hierarchy |
| `systemd-cgtop` | Interactive cgroups resource monitor (like top for cgroups). | `systemd-cgtop` | Resource monitoring |
| `hostnamectl` | Manages hostname, timezone, localization. | `hostnamectl set-hostname myserver` | Configure host |
| `localectl` | Manages keyboard layout and locale. | `localectl set-locale LANG=en_US.UTF-8` | Configure locale |
| `timedatectl` | Manages date, time, timezone, NTP. | `timedatectl set-timezone Europe/Moscow` | Configure time |
| `loginctl` | Manages user sessions. | `loginctl list-sessions` | List sessions |
| `networkctl` | Manages network interfaces via systemd-networkd. | `networkctl status` | Network status |

---

## 11. Python and Ecosystem

Python is the primary language for data, AI, and automation. The sandbox has Python 3.12 and 3.13 installed, along with many libraries and tools.

**Version:** Python 3.12.13 / 3.13 | **pip:** 25.1.1

| Command | Description | Example | When to Use |
|---------|-------------|---------|-------------|
| `python3` | Python 3 interpreter. Flag `-c` - execute string, `-m` - run module. | `python3 -c "print('Hello')"` | Run Python |
| `pip` | Python package manager. `install`, `uninstall`, `list`, `show`, `freeze`. | `pip install pandas` | Install a library |
| `pip3` | Alias for pip for Python 3. | `pip3 install requests` | Install library (Python 3) |
| `ipython` | Interactive Python shell with syntax highlighting, autocompletion, and magic commands. | `ipython` | Interactive Python work |
| `jupyter` | Runs Jupyter Notebook/Lab - interactive environment for data analysis. | `jupyter lab --port 8888` | Data analysis in browser |
| `jupyter-lab` | JupyterLab - next generation Jupyter Notebook. | `jupyter-lab` | Interactive data analysis |
| `jupyter-notebook` | Classic Jupyter Notebook. | `jupyter-notebook` | Run notebook |
| `pytest` | Testing framework. Automatically finds tests in `test_*.py` files. | `pytest tests/ -v` | Run tests |
| `coverage` | Measures code test coverage. | `coverage run -m pytest && coverage report` | Check test coverage |
| `debugpy` | Python debugger for VS Code and other IDEs. | `debugpy --listen 5678 script.py` | Remote debugging |
| `pydoc` | Generates documentation from Python docstrings. | `pydoc pandas.DataFrame` | Module documentation |
| `pygmentize` | Syntax highlights code (500+ languages supported). | `pygmentize script.py` | Code highlighting |
| `spacy` | NLP library (Natural Language Processing). | `spacy download en_core_web_sm` | NLP text processing |
| `numba` | Python JIT compiler for accelerating numerical computations. | `numba -s` | Numba information |
| `bokeh` | Interactive data visualization library. | `bokeh serve app.py` | Interactive charts |
| `gradio` | Quick web interface creation for ML models. | `gradio app.py` | ML model demo |
| `fastapi` | Framework for creating Python APIs. | `fastapi dev main.py` | Create API |
| `uvicorn` | ASGI server for running FastAPI and other ASGI applications. | `uvicorn main:app --host 0.0.0.0` | Run web server |
| `httpx` | Modern HTTP client for Python (supports HTTP/2). | `httpx` | HTTP requests from Python |
| `f2py` | Python-Fortran interface generator. | `f2py -c fib1.f90 -m fib1` | Fortran and Python integration |

---

## 12. Node.js / JavaScript / TypeScript

Node.js is a JavaScript runtime on the server. The sandbox has the latest version and several package managers installed.

**Version:** Node.js v24.15.0 | **npm:** 11.12.1 | **Bun:** 1.3.13

| Command | Description | Example | When to Use |
|---------|-------------|---------|-------------|
| `node` | JavaScript runtime. Executes JS files. Flag `-e` - execute inline code. | `node -e "console.log('hi')"` | Run JavaScript |
| `npm` | Node.js package manager. `install`, `run`, `test`, `publish`. | `npm install express` | Install Node.js packages |
| `npx` | Executes npm packages without installing. | `npx create-next-app` | Run package without install |
| `bun` | Fast JavaScript runtime and package manager. | `bun add react` | Fast package management |
| `tsc` | TypeScript compiler. Compiles `.ts` to `.js`. | `tsc --noEmit` | Type-check TypeScript code |
| `tsx` | TypeScript execute - runs TS files directly. | `tsx script.ts` | Run TypeScript files |
| `eslint` | JavaScript/TypeScript linter. | `eslint src/ --fix` | Check code quality |
| `prettier` | Code formatter. Supports JS, TS, CSS, JSON. | `prettier --write src/` | Format code |
| `next` | Next.js CLI. `dev`, `build`, `start`, `lint`. | `npx next build` | Build Next.js project |
| `react-scripts` | Create React App scripts. | `react-scripts build` | Build React app |

---

## 13. Java

Java is a compiled language for cross-platform applications. The sandbox includes the JDK for compilation and the JVM for execution.

**Version:** OpenJDK 21

| Command | Description | Example | When to Use |
|---------|-------------|---------|-------------|
| `javac` | Java compiler. Compiles `.java` to `.class`. | `javac Main.java` | Compile Java code |
| `java` | Java runtime. Runs compiled `.class` files. | `java Main` | Run Java application |
| `jar` | Java archiver. Creates/extracts JAR files. | `jar -cf app.jar *.class` | Package Java application |
| `javadoc` | Generates HTML documentation from Java comments. | `javadoc -d docs src/*.java` | Generate Java docs |
| `jshell` | Interactive Java REPL (Read-Eval-Print Loop). | `jshell` | Interactive Java testing |
| `jps` | Shows JVM process IDs. | `jps -l` | List Java processes |
| `jstack` | Shows Java thread stack traces. | `jstack 12345` | Debug Java threads |
| `jmap` | Shows Java heap memory map. | `jmap -heap 12345` | Analyze Java heap |
| `mvn` | Apache Maven - build automation for Java. | `mvn clean install` | Build Java project |
| `gradle` | Gradle build system. | `gradle build` | Build with Gradle |

---

## 14. Perl

Perl is a scripting language for text processing, system administration, and web development.

**Version:** Perl 5.38

| Command | Description | Example | When to Use |
|---------|-------------|---------|-------------|
| `perl` | Perl interpreter. Flag `-e` - execute inline. | `perl -e "print 'hi'"` | Run Perl scripts |
| `perldoc` | Shows Perl documentation. | `perldoc -f print` | Perl documentation |
| `cpan` | Perl module installer (Comprehensive Perl Archive Network). | `cpan install DBI` | Install Perl modules |
| `cpanm` | Lightweight CPAN client (cpanminus). | `cpanm Moose` | Quick Perl module install |
| `pl2pm` | Converts Perl library to Perl module. | `pl2pm lib.pl` | Convert script to module |
| `splain` | Explains Perl warnings and errors. | `perl -w script.pl 2>&1 \| splain` | Understand Perl errors |

---

## 15. C/C++ and Build Tools

C and C++ are compiled languages for system programming and performance-critical applications.

**C Compiler:** GCC 12.2 | **C++ Compiler:** G++ 12.2 | **LLVM:** 16

| Command | Description | Example | When to Use |
|---------|-------------|---------|-------------|
| `gcc` | GNU C compiler. Flag `-o` - output file, `-Wall` - all warnings. | `gcc -o program main.c` | Compile C code |
| `g++` | GNU C++ compiler. | `g++ -o program main.cpp` | Compile C++ code |
| `clang` | LLVM C compiler. Fast compilation, clear error messages. | `clang -o program main.c` | Compile with Clang |
| `clang++` | LLVM C++ compiler. | `clang++ -o program main.cpp` | Compile C++ with Clang |
| `make` | Build automation tool. Uses Makefile. | `make && make install` | Build project |
| `cmake` | Cross-platform build system generator. | `cmake -B build && cmake --build build` | Configure and build |
| `gdb` | GNU Debugger for C/C++. | `gdb ./program` | Debug a program |
| `ldd` | Shows shared library dependencies. | `ldd /usr/bin/python3` | Check library dependencies |
| `objdump` | Displays information from object files. | `objdump -d program` | Disassemble binary |
| `valgrind` | Memory debugging and profiling tool. | `valgrind ./program` | Detect memory leaks |

---

## 16. Git - Version Control

Git is the standard version control system for source code. All sandbox projects use Git for managing changes.

**Version:** Git 2.45

| Command | Description | Example | When to Use |
|---------|-------------|---------|-------------|
| `git init` | Initializes a new Git repository. | `git init` | Start version control |
| `git clone` | Copies a remote repository locally. | `git clone https://github.com/user/repo.git` | Download a repository |
| `git add` | Stages changes for commit. | `git add .` | Stage files for commit |
| `git commit` | Commits staged changes. | `git commit -m "feat: add feature"` | Save changes |
| `git push` | Pushes commits to remote. | `git push origin main` | Upload changes |
| `git pull` | Pulls changes from remote. | `git pull origin main` | Update local repo |
| `git status` | Shows working tree status. | `git status` | Check changed files |
| `git log` | Shows commit history. | `git log --oneline -10` | View commit history |
| `git diff` | Shows file differences. | `git diff HEAD~1` | Compare changes |
| `git branch` | Manages branches. | `git branch feature-x` | Create a new branch |
| `git checkout` | Switches branches or restores files. | `git checkout main` | Switch branch |
| `git merge` | Merges branches. | `git merge feature-x` | Merge feature branch |
| `git rebase` | Reapplies commits on top of another branch. | `git rebase main` | Linearize history |
| `git stash` | Temporarily saves uncommitted changes. | `git stash pop` | Save and restore changes |
| `git submodule` | Manages submodules. | `git submodule update --init` | Clone submodules |
| `git tag` | Creates tags (releases). | `git tag v1.0.0` | Mark a release |

---

## 17. Documents and Conversion

Tools for working with and converting between document formats (PDF, text, markup, etc.).

| Command | Description | Example | When to Use |
|---------|-------------|---------|-------------|
| `pandoc` | Universal document converter (Markdown, HTML, PDF, DOCX, LaTeX). | `pandoc README.md -o README.pdf` | Convert document format |
| `groff` | Document formatting system (man pages, etc.). | `groff -man -Tpdf manpage.1 > manpage.pdf` | Create formatted documents |
| `man` | Shows system manual pages. | `man ls` | Read manual |
| `tex` | TeX typesetting system. | `tex document.tex` | Typeset TeX document |
| `pdflatex` | Compiles LaTeX to PDF. | `pdflatex article.tex` | Create PDF from LaTeX |
| `lualatex` | LuaLaTeX compiler (LaTeX with Lua scripting). | `lualatex document.tex` | Modern LaTeX compilation |
| `xelatex` | XeLaTeX compiler (supports Unicode and modern fonts). | `xelatex document.tex` | Unicode LaTeX compilation |
| `bibtex` | Bibliography management for LaTeX. | `bibtex article` | Process bibliography |
| `detex` | Strips LaTeX commands, leaving plain text. | `detex article.tex > article.txt` | Extract text from LaTeX |

---

## 18. Graphics, Video, Images

Tools for image processing, video manipulation, and graphic file conversion.

| Command | Description | Example | When to Use |
|---------|-------------|---------|-------------|
| `convert` | ImageMagick - image format conversion and processing. | `convert input.png output.jpg` | Convert image format |
| `identify` | Shows image metadata (dimensions, format, colors). | `identify image.png` | Get image info |
| `mogrify` | Batch image processing (resize, format change). | `mogrify -resize 800x600 *.jpg` | Batch resize images |
| `ffmpeg` | Universal audio/video converter and processor. | `ffmpeg -i input.mp4 output.gif` | Convert video |
| `ffprobe` | Shows media file metadata. | `ffprobe video.mp4` | Get video info |
| `ffplay` | Simple media player. | `ffplay video.mp4` | Play video file |
| `exiftool` | Reads/writes EXIF metadata in images. | `exiftool image.jpg` | View image metadata |
| `pngquant` | PNG compression (lossy). | `pngquant --quality=80 image.png` | Compress PNG |
| `optipng` | PNG lossless compression. | `optipng image.png` | Optimize PNG |
| `jpegoptim` | JPEG lossless/lossy compression. | `jpegoptim --max=85 image.jpg` | Optimize JPEG |
| `rsvg-convert` | Converts SVG to PNG/PDF. | `rsvg-convert icon.svg -o icon.png` | Convert SVG to PNG |

---

## 19. Maps and Geodata (GDAL/OGR)

Geospatial data processing tools. GDAL handles raster formats, OGR handles vector formats.

**Version:** GDAL 3.9

| Command | Description | Example | When to Use |
|---------|-------------|---------|-------------|
| `gdalinfo` | Shows raster file metadata. | `gdalinfo terrain.tif` | Get raster info |
| `gdal_translate` | Converts raster format. | `gdal_translate input.tif output.png` | Convert raster |
| `gdalwarp` | Warps, reprojects, and clips rasters. | `gdalwarp -t_srs EPSG:4326 input.tif output.tif` | Reproject raster |
| `ogr2ogr` | Converts vector formats. | `ogr2ogr output.gpkg input.shp` | Convert vector data |
| `ogrinfo` | Shows vector file metadata. | `ogrinfo data.geojson` | Get vector info |
| `gdalsrsinfo` | Shows coordinate reference system info. | `gdalsrsinfo EPSG:4326` | CRS information |
| `gdalbuildvrt` | Builds virtual raster from multiple files. | `gdalbuildvrt mosaic.vrt *.tif` | Create raster mosaic |

---

## 20. Data and Formats

Tools for working with structured data: compression, encoding, conversion between formats.

| Command | Description | Example | When to Use |
|---------|-------------|---------|-------------|
| `csvkit` | Suite of CSV processing utilities. | `csvcut -c 1,3 data.csv` | Process CSV files |
| `xsv` | Fast CSV command-line toolkit. | `xsv search "pattern" data.csv` | Fast CSV search |
| `in2csv` | Converts various formats to CSV. | `in2csv data.xlsx > data.csv` | Convert to CSV |
| `csvformat` | Formats CSV (delimiter, quoting). | `csvformat -D '|' data.csv` | Change CSV delimiter |
| `sqlite3` | SQLite database command-line tool. | `sqlite3 db.sqlite "SELECT * FROM users"` | Query SQLite |
| `parquet-tools` | Apache Parquet file tools. | `parquet-tools schema data.parquet` | Inspect Parquet schema |
| `protoc` | Protocol Buffers compiler. | `protoc --python_out=. data.proto` | Compile Protobuf |
| `avro-tools` | Apache Avro file tools. | `avro-tools getmeta data.avro` | Avro metadata |

---

## 21. Web Servers and API

Tools for running web servers, testing APIs, and network services.

| Command | Description | Example | When to Use |
|---------|-------------|---------|-------------|
| `python3 -m http.server` | Simple HTTP server (Python). | `python3 -m http.server 8080` | Quick file server |
| `npx serve` | Static file server via npx. | `npx serve .` | Serve static files |
| `nginx` | High-performance web server. | `nginx -t` | Test nginx config |
| `apache2` | Apache HTTP Server. | `apache2ctl -S` | Apache status |
| `socat` | Multipurpose relay. | `socat TCP-LISTEN:8080,fork TCP:localhost:3000` | Port forwarding |
| `mitmproxy` | Interactive HTTPS proxy. | `mitmproxy --listen-port 8080` | Traffic inspection |
| `wrk` | HTTP benchmarking tool. | `wrk -t4 -c100 https://example.com` | Load testing |
| `ab` | Apache HTTP server benchmarking tool. | `ab -n 1000 -c 10 https://example.com/` | Performance testing |

---

## 22. Databases

Database management systems and CLI tools for data storage and retrieval.

| Command | Description | Example | When to Use |
|---------|-------------|---------|-------------|
| `sqlite3` | SQLite CLI. Full SQL support. | `sqlite3 db.sqlite "SELECT * FROM users"` | Query SQLite database |
| `psql` | PostgreSQL interactive terminal. | `psql -d mydb -c "SELECT * FROM users"` | Query PostgreSQL |
| `mysql` | MySQL command-line client. | `mysql -u root -p -e "SHOW DATABASES"` | Query MySQL |
| `redis-cli` | Redis command-line client. | `redis-cli GET mykey` | Query Redis |
| `mongosh` | MongoDB Shell. | `mongosh --eval "db.users.find()"` | Query MongoDB |
| `bunx prisma` | Prisma ORM CLI. | `bunx prisma db push` | Manage Prisma schema |
| `pg_isready` | Checks PostgreSQL server status. | `pg_isready` | Is PostgreSQL running? |
| `mongod` | MongoDB daemon. | `mongod --dbpath /data/db` | Start MongoDB |

---

## 23. Editors

Command-line text editors and file manipulation tools available in the sandbox.

| Command | Description | Example | When to Use |
|---------|-------------|---------|-------------|
| `vim` | Modal text editor (successor of vi). | `vim file.txt` | Edit text files |
| `nano` | Simple terminal text editor. | `nano config.yaml` | Quick edits |
| `emacs` | Extensible text editor. | `emacs file.txt` | Full-featured editing |
| `code` | VS Code CLI (if available). | `code .` | Open VS Code |
| `micro` | Modern terminal editor with mouse support. | `micro file.txt` | User-friendly terminal editing |
| `sed` | Stream editor for scripted editing. | `sed -i 's/foo/bar/g' file.txt` | Scripted replacements |
| `awk` | Pattern scanning and processing. | `awk '{print $1}' data.txt` | Text processing |
| `ed` | Original Unix line editor. | `ed file.txt` | Scripted editing |

---

## 24. Special Z.ai Commands

Commands specific to the Z.ai sandbox environment for managing the development container.

| Command | Description | Example | When to Use |
|---------|-------------|---------|-------------|
| `echo $FC_CONTAINER_ID` | Shows the sandbox container ID. | `echo $FC_CONTAINER_ID` | Get preview URL |
| `curl ... init-fullstack ...` | Initializes or reinitializes the sandbox. | `curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1775040338514.sh | bash` | Start fresh sandbox |
| `cat .zscripts/dev.log` | Reads dev server logs. | `cat .zscripts/dev.log \| tail -30` | Debug dev server |
| `cat .zscripts/dev.pid` | Shows dev server process ID. | `cat .zscripts/dev.pid` | Check if dev server is running |
| `pkill -f "next dev"` | Kills the Next.js dev server process. | `pkill -f "next dev"` | Restart dev server |
| `bun run lint` | Runs ESLint on the project. | `bun run lint` | Check code quality |
| `bunx tsc --noEmit` | TypeScript type checking. | `bunx tsc --noEmit` | Check TypeScript types |
| `bun add <package>` | Installs a package via Bun. | `bun add framer-motion` | Add dependencies |

---

## 25. Other Useful Utilities

Tools for system package management, quick installations, and other common tasks.

### System Package Installation

```bash
# System packages (Debian/Ubuntu)
apt install -y <package>

# Python packages
pip install <package>

# Node.js packages
npm install -g <package>
# or
bun add <package>

# Fast Python installation (uv - faster than pip)
uv pip install <package>
```

### Quick Reference

```bash
# System information
uname -a          # Kernel version
cat /etc/os-release  # OS version
free -h           # Memory usage
df -h             # Disk usage
lscpu             # CPU info
nvidia-smi        # GPU info (if available)

# Process management
ps aux            # All processes
top               # Interactive monitor
kill -9 <PID>     # Force kill

# File operations
ls -la            # Detailed listing
find / -name "*.config"  # Search files
du -sh *          # Directory sizes

# Text processing
grep -rn "text" .  # Search in files
sed -i 's/a/b/g'   # Replace text
awk '{print $1}'   # Extract column
```

---

*Reference compiled for Z.ai sandbox. Total of 1321 commands available.*
