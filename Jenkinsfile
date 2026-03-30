pipeline {
    agent any

    environment {
        DEPLOY_USER = "abdenab"
        DEPLOY_HOST = "10.8.101.33"
        DEPLOY_PATH = "/home/abdenab/myapp"
    }

    stages {
        stage('Checkout SCM') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/AbdenaBelachew/tst-jenkinsLast1.git'
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
                withCredentials([sshUserPrivateKey(
                    credentialsId: 'abdenab_ssh_key',
                    keyFileVariable: 'SSH_KEY_FILE',
                    usernameVariable: 'SSH_USER'
                )]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no -i \$SSH_KEY_FILE \$DEPLOY_USER@\$DEPLOY_HOST 'mkdir -p \$DEPLOY_PATH && rm -rf \$DEPLOY_PATH/*'
                        scp -i \$SSH_KEY_FILE -r frontend/dist/* \$DEPLOY_USER@\$DEPLOY_HOST:\$DEPLOY_PATH/
                        scp -i \$SSH_KEY_FILE -r backend/* \$DEPLOY_USER@\$DEPLOY_HOST:\$DEPLOY_PATH/
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ Deployment succeeded!"
        }
        failure {
            echo "❌ Deployment failed! Check logs above."
        }
    }
}
