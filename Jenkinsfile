pipeline {
    agent any

    environment {
        DEPLOY_PATH = "/home/abdenab/myapp"
        TARGET_SERVER = "10.8.101.33"
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
                withCredentials([sshUserPrivateKey(credentialsId: 'abdenab_ssh_key', keyFileVariable: 'SSH_KEY_FILE', usernameVariable: 'SSH_USER')]) {
                    sh """
                        echo "Deploying to $TARGET_SERVER..."
                        ssh -o StrictHostKeyChecking=no -i \$SSH_KEY_FILE \$SSH_USER@\$TARGET_SERVER 'mkdir -p $DEPLOY_PATH && rm -rf $DEPLOY_PATH/*'
                        scp -i \$SSH_KEY_FILE -r frontend/dist/* \$SSH_USER@\$TARGET_SERVER:$DEPLOY_PATH/
                        scp -i \$SSH_KEY_FILE -r backend/* \$SSH_USER@\$TARGET_SERVER:$DEPLOY_PATH/
                        echo "Deployment finished!"
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ Deployment successful!"
        }
        failure {
            echo "❌ Deployment failed! Check logs above."
        }
    }
}
