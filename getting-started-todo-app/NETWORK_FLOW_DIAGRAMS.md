# Docker Todo App - Network Flow Diagrams

This document explains the network flow for accessing the Docker Todo App in 4 different scenarios.

## Overview

The Todo App runs in Docker containers on an EC2 instance with the following architecture:
- **Traefik Proxy**: Routes requests to appropriate services
- **React Client**: Frontend application (Vite dev server)
- **Node.js Backend**: API server
- **MySQL Database**: Data persistence

## Network Components

| Component | IP Address | Port | Purpose |
|-----------|------------|------|---------|
| **EC2 Public IP** | 13.125.18.51 | 8000 | External access point |
| **EC2 Private IP** | 172.31.5.117 | 8000 | Internal access point |
| **Traefik Proxy** | 172.18.0.5 | 80 | Reverse proxy & routing |
| **React Client** | 172.18.0.4 | 5173 | Frontend (Vite dev server) |
| **Node.js Backend** | 172.18.0.6 | 3000 | API server |
| **MySQL Database** | 172.18.0.2 | 3306 | Data storage |

---

### Notes!
If you just deploy a single instance and it has a public IP, you are using the free NAT functionality of the IGW. You only pay for a NAT Gateway when you intentionally set one up to support instances in a private subnet.
<img width="1579" height="522" alt="2025-10-31_17-22-51" src="https://github.com/user-attachments/assets/def11271-37c2-4689-8881-131b032de01f" />


## Case 1: External Access via Public IP (Laptop → EC2)

**URL**: `http://13.125.18.51:8000/` or `http://ec2-13-125-18-51.ap-northeast-2.compute.amazonaws.com:8000/`

### Network Flow:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              YOUR LAPTOP                                        │
│  Browser/curl: http://13.125.18.51:8000/                                       │
│  Your IP: [Your Laptop IP]                                                      │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ 1. DNS Resolution (if using domain)
                                        │    Your Laptop → Internet DNS
                                        │    Result: 13.125.18.51
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                INTERNET                                         │
│  DNS Query: ec2-13-125-18-51.ap-northeast-2.compute.amazonaws.com              │
│  Response: 13.125.18.51                                                        │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ 2. HTTP Request
                                        │    GET / HTTP/1.1
                                        │    Host: ec2-13-125-18-51.ap-northeast-2.compute.amazonaws.com
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              EC2 INSTANCE                                       │
│  Public IP: 13.125.18.51                                                       │
│  Private IP: 172.31.5.117                                                      │
│  Interface: ens5                                                                │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ 3. AWS Security Group Check
                                        │    Inbound Rule: Port 8000
                                        │    Source: Your Laptop IP ✅
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            DOCKER PORT MAPPING                                  │
│  Host Port: 8000 → Container Port: 80                                           │
│  Process: docker-proxy (PID: 1234500)                                          │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ 4. Docker Bridge Network
                                        │    Network: getting-started-todo-app_default
                                        │    Subnet: 172.18.0.0/16
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              TRAEFIK PROXY                                      │
│  Container: getting-started-todo-app-proxy-1                                    │
│  IP: 172.18.0.5                                                                 │
│  Port: 80 (internal)                                                            │
│  Image: traefik:v3.4                                                            │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ 5. Host-based Routing
                                        │    Host: ec2-13-125-18-51.ap-northeast-2.compute.amazonaws.com
                                        │    Path: / (root)
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              ROUTING DECISION                                   │
│                                                                                 │
│  IF Host = localhost OR ec2-13-125-18-51.ap-northeast-2.compute.amazonaws.com  │
│  AND Path = / (not /api/*)                                                     │
│                                                                                 │
│  → Route to CLIENT (React App)                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ 6. Forward to Client
                                        │    Target: 172.18.0.4:5173
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              REACT CLIENT                                       │
│  Container: getting-started-todo-app-client-1                                   │
│  IP: 172.18.0.4                                                                 │
│  Port: 5173                                                                     │
│  Service: Vite Dev Server                                                       │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ 7. Response
                                        │    HTML + JS + CSS
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              RESPONSE FLOW                                      │
│  Client → Traefik → Docker → EC2 → Internet → Your Laptop                      │
│  Content: Todo App HTML Page                                                   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Key Points:
- **DNS Resolution**: Internet DNS resolves domain to public IP
- **Security Group**: Must allow inbound traffic on port 8000
- **Direct Connection**: No tunneling required
- **Encryption**: Unencrypted HTTP traffic

---

## Case 2: Localhost Access (Inside EC2)

**URL**: `http://localhost:8000/`

### Network Flow:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              EC2 INSTANCE                                       │
│  Command: curl http://localhost:8000/                                           │
│  Process: curl (running on host)                                               │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ 1. Localhost Resolution
                                        │    localhost → 127.0.0.1
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            LOOPBACK INTERFACE                                   │
│  IP: 127.0.0.1                                                                  │
│  Port: 8000                                                                     │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ 2. Docker Port Mapping
                                        │    Host Port: 8000 → Container Port: 80
                                        │    Process: docker-proxy
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            DOCKER BRIDGE NETWORK                                │
│  Network: getting-started-todo-app_default                                      │
│  Gateway: 172.18.0.1                                                            │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ 3. Forward to Traefik
                                        │    Target: 172.18.0.5:80
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              TRAEFIK PROXY                                      │
│  Container: getting-started-todo-app-proxy-1                                    │
│  IP: 172.18.0.5                                                                 │
│  Port: 80 (internal)                                                            │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ 4. Host-based Routing
                                        │    Host: localhost
                                        │    Path: / (root)
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              ROUTING DECISION                                   │
│                                                                                 │
│  IF Host = localhost OR ec2-13-125-18-51.ap-northeast-2.compute.amazonaws.com  │
│  AND Path = / (not /api/*)                                                     │
│                                                                                 │
│  → Route to CLIENT (React App)                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ 5. Forward to Client
                                        │    Target: 172.18.0.4:5173
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              REACT CLIENT                                       │
│  Container: getting-started-todo-app-client-1                                   │
│  IP: 172.18.0.4                                                                 │
│  Port: 5173                                                                     │
│  Service: Vite Dev Server                                                       │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ 6. Response
                                        │    HTML + JS + CSS
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              RESPONSE FLOW                                      │
│  Client → Traefik → Docker → Loopback → curl                                   │
│  Content: Todo App HTML Page                                                   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Key Points:
- **No DNS Resolution**: localhost resolves to 127.0.0.1
- **No Security Group**: Direct local access
- **Fastest Path**: No network hops
- **Internal Only**: Only works from within EC2

---

## Case 3: External DNS Access (Inside EC2)

**URL**: `http://ec2-13-125-18-51.ap-northeast-2.compute.amazonaws.com:8000/`

### Network Flow:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              EC2 INSTANCE                                       │
│  Command: curl http://ec2-13-125-18-51.ap-northeast-2.compute.amazonaws.com:8000│
│  Process: curl (running on host)                                               │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ 1. DNS Resolution
                                        │    EC2 → AWS Private DNS
                                        │    Result: 172.31.5.117 (private IP)
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            AWS PRIVATE DNS                                      │
│  Query: ec2-13-125-18-51.ap-northeast-2.compute.amazonaws.com                  │
│  Response: 172.31.5.117 (private IP)                                           │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ 2. HTTP Request
                                        │    GET / HTTP/1.1
                                        │    Host: ec2-13-125-18-51.ap-northeast-2.compute.amazonaws.com
                                        │    Target: 172.31.5.117:8000
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              EC2 HOST NETWORK                                   │
│  Private IP: 172.31.5.117                                                      │
│  Interface: ens5                                                                │
│  Port: 8000                                                                     │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ 3. Docker Port Mapping
                                        │    Host Port: 8000 → Container Port: 80
                                        │    Process: docker-proxy
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            DOCKER BRIDGE NETWORK                                │
│  Network: getting-started-todo-app_default                                      │
│  Gateway: 172.18.0.1                                                            │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ 4. Forward to Traefik
                                        │    Target: 172.18.0.5:80
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              TRAEFIK PROXY                                      │
│  Container: getting-started-todo-app-proxy-1                                    │
│  IP: 172.18.0.5                                                                 │
│  Port: 80 (internal)                                                            │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ 5. Host-based Routing
                                        │    Host: ec2-13-125-18-51.ap-northeast-2.compute.amazonaws.com
                                        │    Path: / (root)
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              ROUTING DECISION                                   │
│                                                                                 │
│  IF Host = localhost OR ec2-13-125-18-51.ap-northeast-2.compute.amazonaws.com  │
│  AND Path = / (not /api/*)                                                     │
│                                                                                 │
│  → Route to CLIENT (React App)                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ 6. Forward to Client
                                        │    Target: 172.18.0.4:5173
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              REACT CLIENT                                       │
│  Container: getting-started-todo-app-client-1                                   │
│  IP: 172.18.0.4                                                                 │
│  Port: 5173                                                                     │
│  Service: Vite Dev Server                                                       │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ 7. Response
                                        │    HTML + JS + CSS
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              RESPONSE FLOW                                      │
│  Client → Traefik → Docker → Host Network → curl                               │
│  Content: Todo App HTML Page                                                   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Key Points:
- **AWS Private DNS**: Resolves to private IP (172.31.5.117)
- **No Internet**: Direct VPC communication
- **Faster**: No NAT or internet routing
- **Internal Only**: Only works from within AWS VPC

---

## Case 4: Cursor Remote SSH Port Forwarding (Laptop → EC2)

**URL**: `http://localhost:8000/` (from laptop with Cursor Remote SSH)

### Network Flow:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              YOUR LAPTOP                                        │
│  Browser: http://localhost:8000                                                 │
│  User: danny.park@COMP-L63Q5K7CH7                                              │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ 1. Localhost Connection
                                        │    localhost:8000
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            CURSOR REMOTE SSH                                    │
│  Process: Cursor Helper (Plugin)                                               │
│  PID: 56264                                                                     │
│  Port: 8000 (irdmi)                                                            │
│  Auto Port Forwarding: 8000 → 8000                                             │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ 2. SSH Connection
                                        │    ssh -v -T -D 51688 my-ec2
                                        │    Encrypted tunnel
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              EC2 INSTANCE                                       │
│  Public IP: 13.125.18.51                                                       │
│  Private IP: 172.31.5.117                                                      │
│  Connection: my-ec2 (SSH config)                                               │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ 3. Port Forwarding
                                        │    Local 8000 → Remote 8000
                                        │    localhost:8000
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            DOCKER PORT MAPPING                                  │
│  Host Port: 8000 → Container Port: 80                                           │
│  Process: docker-proxy                                                          │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ 4. Docker Bridge Network
                                        │    Network: getting-started-todo-app_default
                                        │    Subnet: 172.18.0.0/16
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              TRAEFIK PROXY                                      │
│  Container: getting-started-todo-app-proxy-1                                    │
│  IP: 172.18.0.5                                                                 │
│  Port: 80 (internal)                                                            │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ 5. Host-based Routing
                                        │    Host: localhost
                                        │    Path: / (root)
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              ROUTING DECISION                                   │
│                                                                                 │
│  IF Host = localhost OR ec2-13-125-18-51.ap-northeast-2.compute.amazonaws.com  │
│  AND Path = / (not /api/*)                                                     │
│                                                                                 │
│  → Route to CLIENT (React App)                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ 6. Forward to Client
                                        │    Target: 172.18.0.4:5173
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              REACT CLIENT                                       │
│  Container: getting-started-todo-app-client-1                                   │
│  IP: 172.18.0.4                                                                 │
│  Port: 5173                                                                     │
│  Service: Vite Dev Server                                                       │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ 7. Response
                                        │    HTML + JS + CSS
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              RESPONSE FLOW                                      │
│  Client → Traefik → Docker → EC2 localhost → SSH Tunnel → Your Laptop          │
│  Content: Todo App HTML Page                                                   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Key Points:
- **Cursor Auto Port Forwarding**: Automatically forwards port 8000
- **SSH Encryption**: All traffic encrypted through SSH tunnel
- **No Security Group**: Uses SSH port 22 (already open)
- **Localhost Access**: Can use localhost:8000 from laptop
- **Most Secure**: Encrypted connection

---

## Summary Comparison

| Case | From | To | DNS Resolution | IP Address | Security | Encryption |
|------|------|----|----------------|------------|----------|------------|
| **External Public** | Laptop | EC2 | Internet DNS | 13.125.18.51 | Security Group | ❌ HTTP |
| **Localhost (EC2)** | EC2 | EC2 | localhost | 127.0.0.1 | None | ❌ HTTP |
| **External DNS (EC2)** | EC2 | EC2 | AWS Private DNS | 172.31.5.117 | None | ❌ HTTP |
| **Cursor SSH** | Laptop | EC2 | localhost | 127.0.0.1 | SSH | ✅ Encrypted |

## Key Insights

1. **DNS Resolution Varies**: Same hostname resolves to different IPs based on source
2. **AWS Private DNS**: Provides internal IPs for VPC communication
3. **Cursor Auto Port Forwarding**: Automatically forwards development ports
4. **Traefik Host Routing**: Routes based on Host header, not just path
5. **Docker Bridge Network**: Isolates containers while enabling communication

## Troubleshooting

- **404 Errors**: Check Traefik routing rules and Host headers
- **Connection Refused**: Check security groups and port mappings
- **DNS Issues**: Verify AWS DNS settings and VPC configuration
- **Port Forwarding**: Check Cursor Remote SSH settings and active connections
