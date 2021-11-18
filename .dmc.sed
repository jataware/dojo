s|published: 8080|published: 8090|
/^ *socat:/,/^[A-Za-z0-9_]/ {
	/^[A-Za-z0-9_]/b 
    d
}
/image:/! s/postgres:/airflow-postgres:/g
/image:/! s/postgres\//airflow-postgres\//g
/image:/! s/redis:$$/airflow-redis:/g
/image:/! s/@redis:/@airflow-redis:/g
/docker.sock:/ d
s|published: 6379|published: 6390|