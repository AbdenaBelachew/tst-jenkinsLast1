pipeline {
    agent any

    environment {
        SSH_KEY = credentials('abdenab_ssh_key') // Jenkins credential ID for your private key
        REMOTE_USER = "abdenab"
        REMOTE_HOST = "10.8.101.33"
        FRONTEND_DIR = "/var/www/myapp"
        BACKEND_DIR = "/home/abdenab/backend"
    }

    stages {
        stage('Checkout SCM') {
            steps {
                git url: 'https://github.com/AbdenaBelachew/tst-jenkinsLast1.git', branch: 'main'
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
                withCredentials([sshUserPrivateKey(credentialsId: 'abdenab_ssh_key', keyFileVariable: 'SSH_KEY_FILE', usernameVariable: 'SSH_USER')]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no -i $SSH_KEY_FILE $REMOTE_USER@$REMOTE_HOST 'sudo mkdir -p $FRONTEND_DIR && sudo chown -R $REMOTE_USER:$REMOTE_USER $FRONTEND_DIR'
                        scp -o StrictHostKeyChecking=no -i $SSH_KEY_FILE -r frontend/dist/. $REMOTE_USER@$REMOTE_HOST:$FRONTEND_DIR
                        ssh -o StrictHostKeyChecking=no -i $SSH_KEY_FILE $REMOTE_USER@$REMOTE_HOST 'sudo systemctl reload nginx'
                    """
                }
            }
        }

        stage('Deploy Backend') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'abdenab_ssh_key', keyFileVariable: 'SSH_KEY_FILE', usernameVariable: 'SSH_USER')]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no -i $SSH_KEY_FILE $REMOTE_USER@$REMOTE_HOST "mkdir -p $BACKEND_DIR"
                        scp -o StrictHostKeyChecking=no -i $SSH_KEY_FILE -r backend/. $REMOTE_USER@$REMOTE_HOST:$BACKEND_DIR
                        ssh -o StrictHostKeyChecking=no -i $SSH_KEY_FILE $REMOTE_USER@$REMOTE_HOST "
                            cd $BACKEND_DIR &&
                            npm install --production &&
                            (pm2 restart my-backend || pm2 start index.js --name my-backend)
                        "
                    """
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
