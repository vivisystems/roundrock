#define	MAX_KEY_SIZE	2048

// PKEY length must be multiples of 8
#define PKEY		{'t', 'h', 'i', 's', 'i', 's', 'r', 'o', \
			 'u', 'n', 'd', 'r', 'o', 'c', 'k', '!', \
			 '\0' }

#define MD5DEEP		{'m', 'd', '5', 'd', 'e', 'e', 'p', \
			 '\0' }

// "%s -r    %s 2>/dev/null | grep -v "%s" | sort | %s"
#define MD5SUM		{'%', 's', ' ', '-', 'r', ' ', ' ', ' ', \
			 ' ', '%', 's', ' ', '2', '>', '/', 'd', \
			 'e', 'v', '/', 'n', 'u', 'l', 'l', '|', \
			 ' ', 'g', 'r', 'e', 'p', ' ', '-', 'v', \
			 ' ', '"', '%', 's', '"', ' ', '|', 's', \
			 'o', 'r', 't', ' ', '|', ' ', '%', 's', \
			 '\0' }

// "bin conf etc init lib scripts sbin usr"
#define MD5FILES	{'b', 'i', 'n', ' ', 'c', 'o', 'n', 'f', \
			 ' ', 'e', 't', 'c', ' ', 'i', 'n', 'i', \
			 't', ' ', 'l', 'i', 'b', ' ', 's', 'c', \
			 'r', 'i', 'p', 't', 's', ' ', 's', 'b', \
			 'i', 'n', ' ', 'u', 's', 'r', \
			 '\0' }

#define GETLICENSE	{'g', 'e', 't', 'S', 'y', 's', 't', 'e', \
			 'm', 'L', 'i', 'c', 'e', 'n', 's', 'e', \
			 'S', 't', 'u', 'b', ' ', '2', '>', '/', \
			 'd', 'e', 'v', '/', 'n', 'u', 'l', 'l', \
			 '\0' }

// "awk '{print $1}' /proc/%d/mounts 2>/dev/null | grep -c -v none 2>/dev/null"
#define	MOUNTS		{'a', 'w', 'k', ' ', '\'', '{', 'p', 'r', \
			 'i', 'n', 't', ' ', '$', '1', '}', '\'', \
			 ' ', '/', 'p', 'r', 'o', 'c', '/', '%', \
			 'd', '/', 'm', 'o', 'u', 'n', 't', 's', \
			 ' ', '2', '>', '/', 'd', 'e', 'v', '/', \
			 'n', 'u', 'l', 'l', ' ', '|', 'g', 'r', \
			 'e', 'p', ' ', '-', 'c', ' ', '-', 'v', \
			 ' ', 'n', 'o', 'n', 'e', ' ', '2', '>', \
			 '/', 'd', 'e', 'v', '/', 'n', 'u', 'l', \
			 'l', \
			 '\0' }

// "/proc/uptime"
#define	UPTIME		{'/', 'p', 'r', 'o', 'c', '/', 'u', 'p', \
			 't', 'i', 'm', 'e', \
			 '\0' }
