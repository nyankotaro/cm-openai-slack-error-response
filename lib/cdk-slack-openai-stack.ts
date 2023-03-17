import * as cdk from 'aws-cdk-lib';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import * as path from 'path';

export class CdkSlackOpenaiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    /**
     * Create Lambda function
     */
    // Read ParameterStore
    const webhookUrl = ssm.StringParameter.fromStringParameterAttributes(this, 'WebhookUrl', {
      parameterName: '/openai/webhook-url',
    });

    // OpenAI Lambda Layer
    const openaiLayer = new lambda.LayerVersion(this, 'OpenaiLayer', {
      layerVersionName: 'openai',
      code: lambda.Code.fromAsset(path.join(__dirname, './assets/openai-layer')),
      compatibleRuntimes: [lambda.Runtime.PYTHON_3_9],
      description: 'OpenAI Lambda Layer',
    });

    // Lambda Function
    const lambdaFunction = new lambda.Function(this, 'OpenaiLambda', {
      code: lambda.Code.fromAsset(path.join(__dirname, './assets')),
      handler: 'lambda_function.lambda_handler',
      runtime: lambda.Runtime.PYTHON_3_9,
      environment: { WEBHOOK_URL: webhookUrl.stringValue },
      functionName: 'openai-lambda',
      layers: [openaiLayer],
      timeout: cdk.Duration.minutes(5),
    });
    lambdaFunction.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['ssm:GetParameter'],
        resources: [`arn:aws:ssm:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:parameter/openai/*`],
      })
    );

    /**
     * Create API Gateway
     */
    const api = new apigw.RestApi(this, 'OpenaiAPIGateway', {
      cloudWatchRole: true,
      deployOptions: {
        loggingLevel: apigw.MethodLoggingLevel.INFO,
      },
      restApiName: 'openai-api-gateway',
    });
    const lambdaIntegration = new apigw.LambdaIntegration(lambdaFunction);
    api.root.addMethod('POST', lambdaIntegration);
  }
}
