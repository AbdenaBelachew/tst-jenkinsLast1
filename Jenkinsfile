pipeline {
    agent any

    environment {
        SSH_KEY = credentials('linux-ssh-creds') // Add your Jenkins SSH credential ID
        DEPLOY_USER = "abdenab"
        DEPLOY_HOST = "10.8.101.33"
        FRONTEND_PATH = "/home/abdenab/myapp"
        BACKEND_PATH = "/home/abdenab/backend"
    }

    stages {
        stage('Checkout SCM') {
            steps {
                checkout([$class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[url: 'https://github.com/AbdenaBelachew/tst-jenkinsLast1.git']]
                ])
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
                    sh """
                        ssh -o StrictHostKeyChecking=no -i $SSH_KEY $DEPLOY_USER@$DEPLOY_HOST 'mkdir -p $FRONTEND_PATH'
                        scp -o StrictHostKeyChecking=no -i $SSH_KEY -r frontend/dist/* $DEPLOY_USER@$DEPLOY_HOST:$FRONTEND_PATH/
                        ssh -o StrictHostKeyChecking=no -i $SSH_KEY $DEPLOY_USER@$DEPLOY_HOST 'sudo nginx -s reload || true'
                    """
                }
            }
        }

        stage('Deploy Backend') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'linux-ssh-creds', keyFileVariable: 'SSH_KEY')]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no -i $SSH_KEY $DEPLOY_USER@$DEPLOY_HOST 'mkdir -p $BACKEND_PATH'
                        scp -o StrictHostKeyChecking=no -i $SSH_KEY -r backend/* $DEPLOY_USER@$DEPLOY_HOST:$BACKEND_PATH/
                        ssh -o StrictHostKeyChecking=no -i $SSH_KEY $DEPLOY_USER@$DEPLOY_HOST '
                            cd $BACKEND_PATH &&
                            npm install --production &&
                            (pm2 restart my-backend || pm2 start index.js --name my-backend)
                        '
                    """
                }
            }
        }
    }

    post {
        success {
            echo '✅ Deployment Successful!'
        }
        failure {
            echo '❌ Deployment Failed! Check logs above.'
        }
    }
}
