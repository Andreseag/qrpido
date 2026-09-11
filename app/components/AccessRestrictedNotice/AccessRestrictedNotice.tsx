export function AccessRestrictedNotice() {
  return (
    <div className="bg-primary/10 border border-primary/20 p-6 rounded-3xl text-foreground">
      <h3 className="font-bold text-base mb-1 text-primary">
        Acceso Restringido
      </h3>
      <p className="text-xs text-muted-foreground">
        Solo los usuarios con rol de{" "}
        <strong className="text-foreground">Owner</strong> pueden modificar los
        datos del restaurante y administrar los roles del personal.
      </p>
    </div>
  );
}
