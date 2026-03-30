pipeline {
    agent any

    environment {
        DEPLOY_USER = "abdenab"
        DEPLOY_HOST = "10.8.101.33"
        FRONTEND_PATH = "/var/www/myapp"        // Standard Nginx path for static files
        BACKEND_PATH = "/home/abdenab/backend"  // Backend folder
    }

    stages {
        stage('Checkout SCM') {
            steps {
                git branch: 'main', url: 'https://github.com/AbdenaBelachew/tst-jenkinsLast1.git'
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Deploy Frontend') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'linux-ssh-creds', keyFileVariable: 'SSH_KEY')]) {
                    sh '''
                        # Create folder if missing
                        ssh -o StrictHostKeyChecking=no -i $SSH_KEY $DEPLOY_USER@$DEPLOY_HOST "sudo mkdir -p $FRONTEND_PATH && sudo chown -R $DEPLOY_USER:$DEPLOY_USER $FRONTEND_PATH"
                        
                        # Copy files
                        scp -o StrictHostKeyChecking=no -i $SSH_KEY -r frontend/dist/* $DEPLOY_USER@$DEPLOY_HOST:$FRONTEND_PATH/
                        
                        # Reload Nginx
                        ssh -o StrictHostKeyChecking=no -i $SSH_KEY $DEPLOY_USER@$DEPLOY_HOST "sudo nginx -s reload"
                    '''
                }
            }
        }

        stage('Deploy Backend') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'linux-ssh-creds', keyFileVariable: 'SSH_KEY')]) {
                    sh '''
                        # Create backend folder
                        ssh -o StrictHostKeyChecking=no -i $SSH_KEY $DEPLOY_USER@$DEPLOY_HOST "mkdir -p $BACKEND_PATH"

                        # Copy backend files
                        scp -o StrictHostKeyChecking=no -i $SSH_KEY -r backend/* $DEPLOY_USER@$DEPLOY_HOST:$BACKEND_PATH/

                        # Install production dependencies
                        ssh -o StrictHostKeyChecking=no -i $SSH_KEY $DEPLOY_USER@$DEPLOY_HOST "cd $BACKEND_PATH && npm install --production"

                        # Start or restart backend via PM2
                        ssh -o StrictHostKeyChecking=no -i $SSH_KEY $DEPLOY_USER@$DEPLOY_HOST "pm2 describe my-backend || pm2 start index.js --name my-backend; pm2 restart my-backend"
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "✅ Deployment Successful!"
        }
        failure {
            echo "❌ Deployment Failed! Check logs above."
        }
    }
}
