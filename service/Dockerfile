FROM golang:1.23

WORKDIR /opt/qbaware/kosher

COPY go.mod go.sum ./

RUN go mod download

COPY . . 

RUN go build -o kosher ./cmd/server/main.go

ENTRYPOINT ["./kosher"]
