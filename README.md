# CI CD Test environment with docker and kubernetes - GitLab Project

This is a GitLab project for managing Danny's testing environment related content and development with gitlab.

## TL;DR - What We Accomplished

### ✅ Project Initialization Journey
1. **Started with**: Empty directory with existing `.git` folder
2. **Created initial files**: `README.md` and `.gitignore`
3. **Made first commit**: "Initial project setup with README and .gitignore"
4. **Fixed SSH authentication**: Generated SSH key and added to GitLab
5. **Corrected remote URL**: Changed from `gitlab.com` to local GitLab instance
6. **Successfully pushed**: Project now visible in GitLab dashboard

### 🔧 Technical Corrections Made
- **SSH Key Generation**: Created ED25519 key for secure authentication
- **Remote URL Fix**: Updated from `git@gitlab.com:daenypark/weddingcard-gitlab.git` to `git@ec2-13-125-18-51.ap-northeast-2.compute.amazonaws.com:root/daenypark-project-local.git`
  - **Why Local URL**: The original remote pointed to the public GitLab.com, but you're using a self-hosted GitLab instance running on your EC2 server
  - **Authentication Issue**: SSH keys added to public GitLab.com wouldn't work for your local instance
  - **Network Access**: Your local GitLab instance is accessible at the EC2 IP address, not through gitlab.com
- **Repository Creation**: Created project in local GitLab UI before pushing
  - **Why UI First**: GitLab requires the repository to exist before you can push to it
  - **Namespace Setup**: Project created under `root` namespace with name `daenypark-project-local`

### 📍 Current Project Location
- **Local GitLab Instance**: `http://ec2-13-125-18-51.ap-northeast-2.compute.amazonaws.com/root/daenypark-project-local`
- **Dashboard**: `http://ec2-13-125-18-51.ap-northeast-2.compute.amazonaws.com/dashboard/projects`

## Getting Started

This project has been initialized with Git and is connected to the GitLab repository.

## Project Structure

- `README.md` - Project documentation
- `.gitignore` - Git ignore rules

## Development

To start working on this project:

1. Clone the repository (if not already done)
2. Create or modify files as needed
3. Add changes with `git add .`
4. Commit changes with `git commit -m "your message"`
5. Push to GitLab with `git push origin main`

## GitLab Integration

This project is connected to: `git@ec2-13-125-18-51.ap-northeast-2.compute.amazonaws.com:root/daenypark-project-local.git`

You can view the project dashboard at: http://ec2-13-125-18-51.ap-northeast-2.compute.amazonaws.com/dashboard/projects
