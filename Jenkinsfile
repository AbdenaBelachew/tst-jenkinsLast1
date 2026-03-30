pipeline {
    agent any
    
    stages {
        
        stage('Clone Source') {
            steps {
                git url: 'https://github.com/AbdenaBelachew/tst-jenkinsLast1.git', branch: 'main'
            }
        }
        
        stage('Deploy Backend Incremental') {
            steps {
                sshagent(['linux-ssh-creds']) {
                    sh '''
                      ssh -o StrictHostKeyChecking=no abdenab@10.8.101.33 "
                        mkdir -p /var/backend
                      "
                      
                      rsync -avz --exclude 'node_modules' backend/ abdenab@10.8.101.33:/var/backend/
                      
                      ssh -o StrictHostKeyChecking=no abdenab@10.8.101.33 "
                        chown -R abdenab:abdenab /var/backend
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
        
        stage('Deploy Frontend Incremental to Nginx') {
            steps {
                sshagent(['linux-ssh-creds']) {
                    sh '''
                      ssh -o StrictHostKeyChecking=no abdenab@10.8.101.33 "
                        mkdir -p /var/www/html
                      "
                      
                      rsync -avz frontend/build/ abdenab@10.8.101.33:/var/www/html/
                      
                      ssh -o StrictHostKeyChecking=no abdenab@10.8.101.33 "
                        chown -R www-data:www-data /var/www/html &&
                        find /var/www/html -type d -exec chmod 755 {} \\; &&
                        find /var/www/html -type f -exec chmod 644 {} \\; &&
                        nginx -t && systemctl restart nginx
                      "
                    '''
                }
            }
        }
        
    }
    
    post {
        success {
            echo 'Pipeline completed successfully. Backend and frontend updated incrementally.'
        }
        failure {
            echo 'Pipeline failed.'
        }
    }
}
