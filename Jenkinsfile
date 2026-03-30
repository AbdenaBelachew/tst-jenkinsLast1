pipeline {
    agent any

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
                withCredentials([sshUserPrivateKey(
                    credentialsId: 'ssh_key',
                    keyFileVariable: 'SSH_KEY_FILE',
                    usernameVariable: 'SSH_USER'
                )]) {
                    sh """
                    echo "Deploying to 10.8.101.33..."
                    ssh -o StrictHostKeyChecking=no -i "$SSH_KEY_FILE" "$SSH_USER@10.8.101.33" "mkdir -p '/home/abdenab/myapp' && rm -rf '/home/abdenab/myapp/*'"
                    scp -o StrictHostKeyChecking=no -i "$SSH_KEY_FILE" -r /var/lib/jenkins/workspace/test\\ one/frontend/dist/* "$SSH_USER@10.8.101.33:/home/abdenab/myapp/frontend/"
                    scp -o StrictHostKeyChecking=no -i "$SSH_KEY_FILE" -r /var/lib/jenkins/workspace/test\\ one/backend/* "$SSH_USER@10.8.101.33:/home/abdenab/myapp/backend/"
                    echo "Deployment completed successfully!"
                    """
                }
            }
        }
    }

    post {
        success { echo '✅ Pipeline completed successfully!' }
        failure { echo '❌ Deployment failed! Check logs above.' }
    }
}
