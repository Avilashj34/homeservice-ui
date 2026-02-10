import LeadForm from "@/components/leads/lead-form";

export default function NewLeadPage() {
    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-black">Create New Lead</h1>
                <p className="text-black font-medium">Enter customer details to create a new enquiry.</p>
            </div>
            <LeadForm />
        </div>
    );
}
