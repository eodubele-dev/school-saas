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
                // Add service role key if backend actions need it
                // SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!, 
            },
            transform: {
                cdn: (args) => {
                    args.priceClass = "PriceClass_All"; // Enables Africa Edge Locations
                }
            }
        });
    },
});
