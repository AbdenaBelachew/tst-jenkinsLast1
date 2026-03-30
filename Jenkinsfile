pipeline {
    agent any
    
    stages {
        
        stage('Clone Source') {
            steps {
                git url: 'https://github.com/AbdenaBelachew/tst-jenkinsLast1.git', branch: 'main'
            }
        }
        
        stage('Build Backend') {
            steps {
                dir('backend') {
                    sh 'npm install'
                    sh 'npm run build'  // or adjust if your backend does not need build
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run build'  // creates frontend/build folder
                }
            }
        }
        
        stage('Deploy Frontend to Nginx') {
            steps {
                sshagent(['linux-ssh-creds']) {
                    sh '''
                      # Remove old frontend files
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
        
        stage('Deploy Backend') {
            steps {
                sshagent(['linux-ssh-creds']) {
                    sh '''
                      # Create backend folder
                      ssh -o StrictHostKeyChecking=no abdenab@10.8.101.33 "mkdir -p ~/deploy/backend"
                      
                      # Copy backend files
                      scp -o StrictHostKeyChecking=no -r backend/* abdenab@10.8.101.33:~/deploy/backend/
                    '''
                }
            }
        }
        
    }
    
    post {
        success {
            echo 'Pipeline completed successfully. Frontend is served by Nginx.'
        }
        failure {
            echo 'Pipeline failed.'
        }
    }
}
