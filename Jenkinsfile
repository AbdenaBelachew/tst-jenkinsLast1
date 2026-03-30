pipeline {
    agent any

    environment {
        SSH_KEY_ID = 'abdenab_ssh_key'  // Jenkins credential ID
        REMOTE_USER = 'abdenab'
        REMOTE_HOST = '10.8.101.33'
        FRONTEND_REMOTE_DIR = '/var/www/myapp'
        BACKEND_REMOTE_DIR = '/home/abdenab/backend'
        NODE_ENV = 'production'
    }

    stages {

        stage('Checkout Code') {
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
                withCredentials([sshUserPrivateKey(credentialsId: env.SSH_KEY_ID,
                                                  keyFileVariable: 'SSH_KEY',
                                                  usernameVariable: 'SSH_USER')]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no -i $SSH_KEY $SSH_USER@$REMOTE_HOST 'sudo mkdir -p $FRONTEND_REMOTE_DIR && sudo chown -R $SSH_USER:$SSH_USER $FRONTEND_REMOTE_DIR'
                        scp -o StrictHostKeyChecking=no -i $SSH_KEY -r frontend/dist/. $SSH_USER@$REMOTE_HOST:$FRONTEND_REMOTE_DIR/
                        ssh -o StrictHostKeyChecking=no -i $SSH_KEY $SSH_USER@$REMOTE_HOST 'sudo nginx -s reload'
                    """
                }
            }
        }

        stage('Deploy Backend') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: env.SSH_KEY_ID,
                                                  keyFileVariable: 'SSH_KEY',
                                                  usernameVariable: 'SSH_USER')]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no -i $SSH_KEY $SSH_USER@$REMOTE_HOST 'mkdir -p $BACKEND_REMOTE_DIR'
                        scp -o StrictHostKeyChecking=no -i $SSH_KEY -r backend/. $SSH_USER@$REMOTE_HOST:$BACKEND_REMOTE_DIR/
                        ssh -o StrictHostKeyChecking=no -i $SSH_KEY $SSH_USER@$REMOTE_HOST '
                            cd $BACKEND_REMOTE_DIR &&
                            npm install --omit=dev &&
                            pm2 restart my-backend || pm2 start index.js --name my-backend
                        '
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
            echo "❌ Deployment Failed!"
        }
    }
}
