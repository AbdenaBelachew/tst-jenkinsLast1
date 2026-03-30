pipeline {
    agent any
    
    stages {
        
        stage('Clone Source') {
            steps {
                git url: 'https://github.com/AbdenaBelachew/tst-jenkinsLast1.git', branch: 'main'
            }
        }
        
        stage('Deploy Backend') {
            steps {
                sshagent(['linux-ssh-creds']) {
                    sh '''
                      # Remove old backend
                      ssh -o StrictHostKeyChecking=no abdenab@10.8.101.33 "sudo rm -rf /var/backend && sudo mkdir -p /var/backend"
                      
                      # Copy backend files
                      scp -o StrictHostKeyChecking=no -r backend/* abdenab@10.8.101.33:/tmp/backend/
                      
                      # Move to /var/backend with proper permissions
                      ssh -o StrictHostKeyChecking=no abdenab@10.8.101.33 "
                        sudo mv /tmp/backend/* /var/backend/ &&
                        sudo chown -R abdenab:abdenab /var/backend
                      "
                    '''
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }
        
        stage('Deploy Frontend to Nginx') {
            steps {
                sshagent(['linux-ssh-creds']) {
                    sh '''
                      # Remove old frontend from Nginx
                      ssh -o StrictHostKeyChecking=no abdenab@10.8.101.33 "sudo rm -rf /var/www/html/*"
                      
                      # Copy new frontend build
                      scp -o StrictHostKeyChecking=no -r frontend/build/* abdenab@10.8.101.33:/tmp/frontend_build/
                      
                      # Move to Nginx folder with correct permissions
                      ssh -o StrictHostKeyChecking=no abdenab@10.8.101.33 "
                        sudo mv /tmp/frontend_build/* /var/www/html/ &&
                        sudo chown -R www-data:www-data /var/www/html &&
                        sudo find /var/www/html -type d -exec chmod 755 {} \\; &&
                        sudo find /var/www/html -type f -exec chmod 644 {} \\;
                        sudo nginx -t && sudo systemctl restart nginx
                      "
                    '''
                }
            }
        }
        
    }
    
    post {
        success {
            echo 'Pipeline completed successfully. Frontend is served by Nginx and backend is in /var/backend.'
        }
        failure {
            echo 'Pipeline failed.'
        }
    }
}
