pipeline {
    agent any

    environment {
        REMOTE_USER = 'abdenab'
        REMOTE_HOST = '10.8.101.33'
        DEPLOY_PATH = '/home/abdenab/myapp'
    }

    stages {
        stage('Checkout Code') {
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
                    sh 'npx vite build'
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

        stage('Deploy Frontend and Backend') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'abdenab_ssh_key',
                                                  keyFileVariable: 'SSH_KEY_FILE',
                                                  usernameVariable: 'SSH_USER')]) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no -i $SSH_KEY_FILE $SSH_USER@$REMOTE_HOST "mkdir -p $DEPLOY_PATH && rm -rf $DEPLOY_PATH/*"
                        scp -o StrictHostKeyChecking=no -i $SSH_KEY_FILE -r frontend/dist/* $SSH_USER@$REMOTE_HOST:$DEPLOY_PATH/
                        scp -o StrictHostKeyChecking=no -i $SSH_KEY_FILE -r backend/* $SSH_USER@$REMOTE_HOST:$DEPLOY_PATH/
                    '''
                }
            }
        }
    }

    post {
        success { echo "✅ Deployment Successful!" }
        failure { echo "❌ Deployment Failed! Check logs above." }
    }
}
