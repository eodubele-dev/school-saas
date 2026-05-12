/// <reference path="./.sst/platform/config.d.ts" />
// @ts-nocheck

export default $config({
    app(input) {
        return {
            name: "eduflow-web",
            removal: input?.stage === "production" ? "retain" : "remove",
            home: "aws",
            providers: {
                aws: {
                    region: "us-east-1"
                }
            }
        };
    },
    async run() {
        new sst.aws.Nextjs("EduFlow", {
            domain: {
                name: "eduflow.ng",
                aliases: ["*.eduflow.ng"]
            },
            environment: {
                // Pass essential env vars to the Lambda environment
                NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
                NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!, 

                // AI & Communication
                GOOGLE_API_KEY: process.env.GOOGLE_API_KEY!,
                TERMII_API_KEY: process.env.TERMII_API_KEY!,
                TERMII_SENDER_ID: process.env.TERMII_SENDER_ID!,
                RESEND_API_KEY: process.env.RESEND_API_KEY!,

                // Finance
                PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY!,
                NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
            },
            transform: {
                cdn: (args) => {
                    args.priceClass = "PriceClass_All"; // Enables Africa Edge Locations
                }
            }
        });
    },
});
