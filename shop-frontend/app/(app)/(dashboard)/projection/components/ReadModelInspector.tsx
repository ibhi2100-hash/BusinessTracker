import { GlassSheet } from "@/components/ui/GlassSheet"

export function ReadModelInspector(){
    return <>
    <GlassSheet
        open={inspectorOpen}
        onClose={closeInspector}
        title={selectedProjection}
        subtitle="Materialized read model"
        size="full"
        >
        <ReadModelTable
            projection={selectedProjection}
        />
    </GlassSheet>
            </>
}