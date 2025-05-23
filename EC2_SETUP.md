# EC2 Instance Setup Instructions

Run these commands on your EC2 instance to prepare it for deployment:

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Git
sudo apt install git -y

# Install PM2 globally
sudo npm install -g pm2

# Create directory for the project
mkdir -p ~/quiz-project

# Clone your repository (replace with your repository URL)
git clone https://github.com/nataliea772/quizly-project.git ~/quiz-project

# Initial setup
cd ~/quiz-project
npm install
npm run build
pm2 start npm --name "quiz-app" -- start
```

## Additional Setup

1. Configure your EC2 security group to allow:
   - HTTP (port 80)
   - HTTPS (port 443)
   - SSH (port 22)

2. Set up a reverse proxy with Nginx:

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/quiz-app

# Add this configuration:
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or EC2 public IP

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Create symlink and test configuration
sudo ln -s /etc/nginx/sites-available/quiz-app /etc/nginx/sites-enabled/
sudo nginx -t

# Remove default nginx site and restart
sudo rm /etc/nginx/sites-enabled/default
sudo systemctl restart nginx
```

3. (Optional) Set up SSL with Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
``` 