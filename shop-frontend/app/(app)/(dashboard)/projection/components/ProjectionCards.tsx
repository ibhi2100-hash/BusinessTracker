export function ProjectionStatusCards(){
    <div className="
  grid
  grid-cols-2
  md:grid-cols-3
  xl:grid-cols-5
  gap-4
">

  {projections.map(projection => (

    <GlassCard
      key={projection.name}
      variant={
        projection.status === "FAILED"
          ? "accent"
          : "default"
      }
      className="p-4"
    >

      <div className="flex items-center justify-between">

        <span className="
          text-sm
          font-medium
          text-gray-300
        ">
          {projection.name}
        </span>

        <ProjectionStatusIcon
          status={projection.status}
        />

      </div>

      <div className="
        mt-4
        text-2xl
        font-bold
        text-white
      ">
        {projection.rows}
      </div>

      <p className="
        mt-1
        text-xs
        text-gray-500
      ">
        materialized rows
      </p>

    </GlassCard>

  ))}

</div>
}