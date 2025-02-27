defmodule Dotmd.Dot do
  use Ecto.Schema
  import Ecto.Changeset

  @derive {Jason.Encoder, only: [:color, :pos, :user, :updated_at]}
  schema "dots" do
    field :color, :string
    field :pos, :integer
    field :user, :string

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(dot, attrs) do
    dot
    |> cast(attrs, [:pos, :color])
    |> validate_required([:pos, :color])
  end
end
