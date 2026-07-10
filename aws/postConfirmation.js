import { CognitoIdentityProviderClient, AdminAddUserToGroupCommand } from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient({});

export const handler = async (event) => {
  console.log("Post Confirmation Triggered:", JSON.stringify(event));

  // We only want to assign the group if they just signed up / confirmed
  if (event.triggerSource === "PostConfirmation_ConfirmSignUp") {
    
    // We read the 'custom:role' passed from the frontend during signUp.
    // If it's missing, we default to 'customer'.
    const requestedRole = event.request.userAttributes['custom:role'] || "customer";
    
    // Ensure the groups 'admin' and 'customer' are already created in your User Pool!
    const groupName = requestedRole === "admin" ? "admin" : "customer";
    
    const params = {
      GroupName: groupName,
      UserPoolId: event.userPoolId,
      Username: event.userName,
    };
    
    try {
      const command = new AdminAddUserToGroupCommand(params);
      await client.send(command);
      console.log(`Successfully added user ${event.userName} to group ${groupName}`);
    } catch (err) {
      console.error("Error adding user to group:", err);
      // Don't throw the error, otherwise the user login might fail depending on trigger settings.
    }
  }

  // MUST return the event back to Cognito
  return event;
};
