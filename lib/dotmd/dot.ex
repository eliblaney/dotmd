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
    |> cast(attrs, [:pos, :color, :user])
    |> validate_required([:pos, :color])
    |> validate_inclusion(:pos, 0..70560)
    |> validate_format(:color, ~r/^#[0-9A-Fa-f]{6}$/)
    |> validate_format(:user, ~r/^[0-9A-Za-z]{1,20}$/)
  end
end
