from beacon.db.filters import apply_filters
from beacon.db.schemas import DefaultSchemas
from beacon.db.utils import query_id
from beacon.request.model import RequestParams
from beacon.db import client


def get_runs(entry_id: str, qparams: RequestParams):
    query = apply_filters({}, qparams.query.filters)
    return DefaultSchemas.RUNS, client.beacon.runs \
        .find(query) \
        .skip(qparams.query.pagination.skip) \
        .limit(qparams.query.pagination.limit)


def get_run_with_id(entry_id: str, qparams: RequestParams):
    query = apply_filters({}, qparams.query.filters)
    query = query_id(query, entry_id)
    return DefaultSchemas.RUNS, client.beacon.runs \
        .find(query) \
        .skip(qparams.query.pagination.skip) \
        .limit(qparams.query.pagination.limit)


def get_variants_of_run(entry_id: str, qparams: RequestParams):
    query = {"caseLevelData.runId": entry_id}
    query = apply_filters(query, qparams.query.filters)
    return DefaultSchemas.GENOMICVARIATIONS, client.beacon.genomicVariations \
        .find(query) \
        .skip(qparams.query.pagination.skip) \
        .limit(qparams.query.pagination.limit)


def get_analyses_of_run(entry_id: str, qparams: RequestParams):
    query = {"runId": entry_id}
    query = apply_filters(query, qparams.query.filters)
    return DefaultSchemas.ANALYSES, client.beacon.analyses \
        .find(query) \
        .skip(qparams.query.pagination.skip) \
        .limit(qparams.query.pagination.limit)
