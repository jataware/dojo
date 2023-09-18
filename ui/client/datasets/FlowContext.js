import { createContext } from 'react';

// Currently just used to skip RunJobs when navigating back
// by setting `direction` to 'back' in handleBack in ./RegistrationStepper.js
export const FlowContext = createContext(null);
