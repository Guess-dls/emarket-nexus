-- Function: update order status based on vendor items
create or replace function public.update_commande_status(_commande_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total int;
  v_en_attente int;
  v_en_cours int;
  v_expediee int;
  v_livree int;
  v_annulee int;
  new_status text;
begin
  select 
    count(*) as total,
    count(*) filter (where statut = 'en_attente') as en_attente,
    count(*) filter (where statut = 'en_cours')   as en_cours,
    count(*) filter (where statut = 'expediee')   as expediee,
    count(*) filter (where statut = 'livree')     as livree,
    count(*) filter (where statut = 'annulee')    as annulee
  into v_total, v_en_attente, v_en_cours, v_expediee, v_livree, v_annulee
  from public.vendeur_commandes
  where id_commande = _commande_id;

  if v_total is null or v_total = 0 then
    return; -- nothing to aggregate
  end if;

  if v_livree = v_total then
    new_status := 'livree';
  elsif v_annulee = v_total then
    new_status := 'annulee';
  elsif v_en_cours > 0 then
    new_status := 'en_cours';
  elsif v_expediee > 0 then
    new_status := 'expediee';
  else
    new_status := 'en_attente';
  end if;

  update public.commandes
  set statut = new_status
  where id = _commande_id;
end;
$$;

-- Trigger to call the function after insert/update/delete on vendor items
create or replace function public.trg_after_vendeur_commandes_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'DELETE') then
    perform public.update_commande_status(old.id_commande);
  else
    perform public.update_commande_status(new.id_commande);
  end if;
  return null;
end;
$$;

drop trigger if exists after_vendeur_commandes_change on public.vendeur_commandes;
create trigger after_vendeur_commandes_change
after insert or update or delete on public.vendeur_commandes
for each row execute function public.trg_after_vendeur_commandes_change();