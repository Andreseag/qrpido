export function AccessRestrictedNotice() {
  return (
    <div className="bg-amber-950/40 border border-amber-500/30 p-6 rounded-3xl text-amber-200">
      <h3 className="font-bold text-base mb-1">Acceso Restringido</h3>
      <p className="text-xs text-amber-300/80">
        Solo los usuarios con rol de <strong>Owner</strong> pueden modificar los
        datos del restaurante y administrar los roles del personal.
      </p>
    </div>
  );
}
